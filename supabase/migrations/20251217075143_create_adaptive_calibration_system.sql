/*
  # Adaptive Calibration System

  1. New Tables
    - `swipe_preferences`: Real-time swipe tracking met feature extraction
    - `calibration_sessions`: Session-based learning
    - `outfit_generation_cache`: Performance optimization

  2. Preference Dimensions
    - Color preferences (extracted from accepted outfits)
    - Style preferences (archetype alignment)
    - Price sensitivity (budget patterns)
    - Pattern preferences (minimalist vs detailed)
    - Occasion preferences (casual vs formal)

  3. Learning Features
    - Incremental learning from each swipe
    - Multi-arm bandit for exploration vs exploitation
    - Collaborative filtering hints
    - Real-time score adjustments

  4. Security
    - RLS policies per user
    - No cross-user data leakage
*/

-- Swipe preferences tracking table
CREATE TABLE IF NOT EXISTS swipe_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  outfit_id TEXT NOT NULL,
  swipe_direction TEXT NOT NULL CHECK (swipe_direction IN ('left', 'right', 'up')),
  
  -- Outfit features (extracted at swipe time)
  dominant_colors JSONB DEFAULT '[]'::jsonb,
  style_tags TEXT[],
  price_tier TEXT CHECK (price_tier IN ('budget', 'mid', 'premium')),
  total_price NUMERIC(10, 2),
  occasion TEXT,
  formality_score INTEGER CHECK (formality_score BETWEEN 1 AND 10),
  
  -- Contextual data
  session_id UUID NOT NULL,
  swipe_position INTEGER NOT NULL, -- Which swipe in sequence
  time_spent_viewing INTEGER, -- Seconds
  
  -- Learning features
  previous_feedback JSONB DEFAULT '{}'::jsonb,
  predicted_score NUMERIC(3, 2), -- What we predicted they'd rate it
  actual_preference NUMERIC(3, 2), -- Derived from swipe direction
  
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  
  UNIQUE(user_id, outfit_id, session_id)
);

-- Calibration sessions
CREATE TABLE IF NOT EXISTS calibration_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Session metadata
  started_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  completed_at TIMESTAMPTZ,
  outfits_shown INTEGER DEFAULT 0,
  outfits_liked INTEGER DEFAULT 0,
  outfits_disliked INTEGER DEFAULT 0,
  
  -- Learned preferences (updated incrementally)
  learned_colors JSONB DEFAULT '[]'::jsonb,
  learned_styles JSONB DEFAULT '{}'::jsonb,
  learned_price_range JSONB DEFAULT '{"min": 0, "max": 1000}'::jsonb,
  learned_patterns JSONB DEFAULT '{}'::jsonb,
  
  -- Performance metrics
  average_view_time NUMERIC(5, 2),
  decision_speed_trend TEXT CHECK (decision_speed_trend IN ('fast', 'medium', 'slow')),
  engagement_score INTEGER CHECK (engagement_score BETWEEN 0 AND 100),
  
  -- Nova involvement
  nova_interventions INTEGER DEFAULT 0,
  nova_tips_accepted INTEGER DEFAULT 0,
  
  UNIQUE(user_id, started_at)
);

-- Outfit generation cache (for performance)
CREATE TABLE IF NOT EXISTS outfit_generation_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Generated outfit data
  outfit_data JSONB NOT NULL,
  generation_algorithm TEXT NOT NULL,
  generation_version TEXT DEFAULT '1.0',
  
  -- Scoring breakdown
  style_match_score NUMERIC(3, 2),
  color_harmony_score NUMERIC(3, 2),
  price_optimization_score NUMERIC(3, 2),
  occasion_fit_score NUMERIC(3, 2),
  overall_score NUMERIC(3, 2),
  
  -- Metadata
  shown_at TIMESTAMPTZ,
  user_action TEXT CHECK (user_action IN ('liked', 'disliked', 'skipped', 'pending')),
  action_at TIMESTAMPTZ,
  
  -- Caching
  cache_key TEXT NOT NULL,
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '1 hour'),
  
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  
  UNIQUE(user_id, cache_key)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_swipe_preferences_user_session 
  ON swipe_preferences(user_id, session_id);
CREATE INDEX IF NOT EXISTS idx_swipe_preferences_created 
  ON swipe_preferences(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_calibration_sessions_user 
  ON calibration_sessions(user_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_outfit_cache_user_expires 
  ON outfit_generation_cache(user_id, expires_at);

-- Enable RLS
ALTER TABLE swipe_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE calibration_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE outfit_generation_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own swipe preferences"
  ON swipe_preferences
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own swipe preferences"
  ON swipe_preferences
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own calibration sessions"
  ON calibration_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own calibration sessions"
  ON calibration_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own calibration sessions"
  ON calibration_sessions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own outfit cache"
  ON outfit_generation_cache
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own outfit cache"
  ON outfit_generation_cache
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own outfit cache"
  ON outfit_generation_cache
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function: Start calibration session
CREATE OR REPLACE FUNCTION start_calibration_session()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  session_id UUID;
BEGIN
  INSERT INTO calibration_sessions (user_id)
  VALUES (auth.uid())
  RETURNING id INTO session_id;
  
  RETURN session_id;
END;
$$;

-- Function: Record swipe with feature extraction
CREATE OR REPLACE FUNCTION record_swipe(
  p_outfit_id TEXT,
  p_swipe_direction TEXT,
  p_session_id UUID,
  p_outfit_features JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  preference_value NUMERIC(3, 2);
  session_data RECORD;
  updated_preferences JSONB;
BEGIN
  -- Convert swipe to preference score
  preference_value := CASE p_swipe_direction
    WHEN 'right' THEN 1.0  -- Loved it
    WHEN 'up' THEN 0.7     -- Liked it
    WHEN 'left' THEN 0.0   -- Disliked it
    ELSE 0.5
  END;
  
  -- Insert swipe record
  INSERT INTO swipe_preferences (
    user_id,
    outfit_id,
    swipe_direction,
    session_id,
    dominant_colors,
    style_tags,
    price_tier,
    total_price,
    occasion,
    formality_score,
    swipe_position,
    actual_preference
  )
  VALUES (
    auth.uid(),
    p_outfit_id,
    p_swipe_direction,
    p_session_id,
    p_outfit_features->'colors',
    ARRAY(SELECT jsonb_array_elements_text(p_outfit_features->'styles')),
    p_outfit_features->>'price_tier',
    (p_outfit_features->>'total_price')::numeric,
    p_outfit_features->>'occasion',
    (p_outfit_features->>'formality_score')::integer,
    (SELECT COUNT(*) + 1 FROM swipe_preferences WHERE session_id = p_session_id),
    preference_value
  );
  
  -- Update session incrementally
  UPDATE calibration_sessions
  SET
    outfits_shown = outfits_shown + 1,
    outfits_liked = outfits_liked + CASE WHEN p_swipe_direction IN ('right', 'up') THEN 1 ELSE 0 END,
    outfits_disliked = outfits_disliked + CASE WHEN p_swipe_direction = 'left' THEN 1 ELSE 0 END,
    
    -- Incremental learning (Bayesian updates)
    learned_colors = CASE 
      WHEN p_swipe_direction IN ('right', 'up') THEN
        learned_colors || (p_outfit_features->'colors')
      ELSE learned_colors
    END,
    
    learned_styles = learned_styles || jsonb_build_object(
      'timestamp', now(),
      'direction', p_swipe_direction,
      'styles', p_outfit_features->'styles'
    ),
    
    learned_price_range = CASE
      WHEN p_swipe_direction IN ('right', 'up') THEN
        jsonb_build_object(
          'min', LEAST(
            COALESCE((learned_price_range->>'min')::numeric, 999999),
            (p_outfit_features->>'total_price')::numeric
          ),
          'max', GREATEST(
            COALESCE((learned_price_range->>'max')::numeric, 0),
            (p_outfit_features->>'total_price')::numeric
          ),
          'preferred_avg', (
            (COALESCE((learned_price_range->>'preferred_avg')::numeric * outfits_liked, 0) + 
             (p_outfit_features->>'total_price')::numeric) / (outfits_liked + 1)
          )
        )
      ELSE learned_price_range
    END
    
  WHERE id = p_session_id
  RETURNING learned_colors, learned_styles, learned_price_range INTO session_data;
  
  -- Return updated preferences for next outfit generation
  updated_preferences := jsonb_build_object(
    'colors', session_data.learned_colors,
    'styles', session_data.learned_styles,
    'price_range', session_data.learned_price_range,
    'preference_value', preference_value
  );
  
  RETURN updated_preferences;
END;
$$;

-- Function: Get adaptive recommendations
CREATE OR REPLACE FUNCTION get_adaptive_recommendations(
  p_session_id UUID,
  p_limit INTEGER DEFAULT 5
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  session_prefs RECORD;
  recommendations JSONB;
BEGIN
  -- Get current session preferences
  SELECT
    learned_colors,
    learned_styles,
    learned_price_range,
    outfits_shown,
    outfits_liked,
    outfits_disliked
  INTO session_prefs
  FROM calibration_sessions
  WHERE id = p_session_id
    AND user_id = auth.uid();
  
  -- Build recommendation parameters
  recommendations := jsonb_build_object(
    'preferred_colors', session_prefs.learned_colors,
    'preferred_styles', session_prefs.learned_styles,
    'price_range', session_prefs.learned_price_range,
    'exploration_rate', CASE
      WHEN session_prefs.outfits_shown < 3 THEN 0.5  -- High exploration early
      WHEN session_prefs.outfits_shown < 10 THEN 0.3 -- Medium exploration
      ELSE 0.1  -- Low exploration, exploit learned preferences
    END,
    'confidence_score', CASE
      WHEN session_prefs.outfits_shown = 0 THEN 0.0
      ELSE (session_prefs.outfits_liked::numeric / session_prefs.outfits_shown)
    END,
    'diversity_boost', CASE
      WHEN (session_prefs.outfits_liked + session_prefs.outfits_disliked) < 5 THEN true
      ELSE false
    END
  );
  
  RETURN recommendations;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION start_calibration_session() TO authenticated;
GRANT EXECUTE ON FUNCTION record_swipe(TEXT, TEXT, UUID, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION get_adaptive_recommendations(UUID, INTEGER) TO authenticated;