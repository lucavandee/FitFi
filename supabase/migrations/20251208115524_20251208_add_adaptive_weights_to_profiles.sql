/*
  # Add Adaptive Learning to Style Profiles

  1. Changes
    - Add `adaptive_archetype_weights` (jsonb) to store learned preferences
    - Add `total_feedback_count` (integer) to track feedback sample size
    - Add `last_weight_update` (timestamptz) to track freshness
    - Add `learning_enabled` (boolean) to allow users to opt in/out

  2. Purpose
    - Enable machine learning from user feedback
    - Continuously improve recommendation accuracy
    - Track learning progress and confidence
*/

-- Add adaptive learning columns to style_profiles
ALTER TABLE style_profiles
ADD COLUMN IF NOT EXISTS adaptive_archetype_weights jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS total_feedback_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_weight_update timestamptz,
ADD COLUMN IF NOT EXISTS learning_enabled boolean DEFAULT true;

-- Create index for faster adaptive weight queries
CREATE INDEX IF NOT EXISTS idx_style_profiles_learning_enabled
  ON style_profiles(learning_enabled)
  WHERE learning_enabled = true;

-- Add columns to outfit_match_feedback for richer feedback
ALTER TABLE outfit_match_feedback
ADD COLUMN IF NOT EXISTS liked boolean,
ADD COLUMN IF NOT EXISTS archetype text,
ADD COLUMN IF NOT EXISTS secondary_archetype text,
ADD COLUMN IF NOT EXISTS occasion text,
ADD COLUMN IF NOT EXISTS feedback_type text CHECK (feedback_type IN ('like', 'dislike', 'save', 'skip')),
ADD COLUMN IF NOT EXISTS session_id text;

-- Make user_id nullable for anonymous feedback
ALTER TABLE outfit_match_feedback
ALTER COLUMN user_id DROP NOT NULL;

-- Create composite index for feedback queries
CREATE INDEX IF NOT EXISTS idx_outfit_match_feedback_user_archetype
  ON outfit_match_feedback(user_id, archetype)
  WHERE archetype IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_outfit_match_feedback_session_archetype
  ON outfit_match_feedback(session_id, archetype)
  WHERE session_id IS NOT NULL;

-- Update RLS policies to allow session-based feedback
DROP POLICY IF EXISTS "Users can create own feedback" ON outfit_match_feedback;
DROP POLICY IF EXISTS "Users can view own feedback" ON outfit_match_feedback;
DROP POLICY IF EXISTS "Users can update own feedback" ON outfit_match_feedback;

-- New policies that support both user_id and session_id
CREATE POLICY "Users can create own feedback"
  ON outfit_match_feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can view own feedback"
  ON outfit_match_feedback
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own feedback"
  ON outfit_match_feedback
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow anonymous users to insert session-based feedback
CREATE POLICY "Anonymous can create session feedback"
  ON outfit_match_feedback
  FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL AND session_id IS NOT NULL);

-- Function to calculate adaptive weights from feedback
CREATE OR REPLACE FUNCTION calculate_user_adaptive_weights(
  p_user_id uuid,
  p_base_weights jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb AS $$
DECLARE
  v_feedback_count integer;
  v_weights jsonb;
  v_archetype text;
  v_like_ratio numeric;
  v_total integer;
  v_likes integer;
  v_current_weight numeric;
  v_target_weight numeric;
  v_learning_rate numeric;
  v_confidence numeric;
  v_adjustment numeric;
  v_new_weight numeric;
BEGIN
  -- Get total feedback count
  SELECT COUNT(*) INTO v_feedback_count
  FROM outfit_match_feedback
  WHERE user_id = p_user_id;

  -- Need at least 3 feedback items to start learning
  IF v_feedback_count < 3 THEN
    RETURN p_base_weights;
  END IF;

  -- Initialize weights with base weights
  v_weights := p_base_weights;

  -- Calculate learning rate (decreases with more data)
  v_learning_rate := GREATEST(0.05, 1.0 / SQRT(v_feedback_count));

  -- Loop through each archetype with feedback
  FOR v_archetype, v_total, v_likes IN
    SELECT
      archetype,
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE liked = true) as likes
    FROM outfit_match_feedback
    WHERE user_id = p_user_id
      AND archetype IS NOT NULL
    GROUP BY archetype
  LOOP
    -- Calculate like ratio
    v_like_ratio := v_likes::numeric / v_total::numeric;

    -- Calculate confidence (0-1) based on sample size
    v_confidence := LEAST(1.0, v_total::numeric / 10.0);

    -- Get current weight (default to 50 if not set)
    v_current_weight := COALESCE((v_weights ->> v_archetype)::numeric, 50.0);

    -- Target weight based on feedback (0-100 scale)
    v_target_weight := v_like_ratio * 100;

    -- Calculate adjustment with learning rate and confidence
    v_adjustment := (v_target_weight - v_current_weight) * v_learning_rate * v_confidence;

    -- Apply adjustment (clamp between 0-100)
    v_new_weight := GREATEST(0, LEAST(100, v_current_weight + v_adjustment));

    -- Update weights
    v_weights := jsonb_set(
      v_weights,
      ARRAY[v_archetype],
      to_jsonb(ROUND(v_new_weight)),
      true
    );
  END LOOP;

  RETURN v_weights;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-update adaptive weights after feedback
CREATE OR REPLACE FUNCTION auto_update_adaptive_weights()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update for authenticated users
  IF NEW.user_id IS NOT NULL THEN
    -- Update the user's adaptive weights
    UPDATE style_profiles
    SET
      adaptive_archetype_weights = calculate_user_adaptive_weights(NEW.user_id, adaptive_archetype_weights),
      total_feedback_count = (
        SELECT COUNT(*)
        FROM outfit_match_feedback
        WHERE user_id = NEW.user_id
      ),
      last_weight_update = now()
    WHERE user_id = NEW.user_id
      AND learning_enabled = true;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update weights
DROP TRIGGER IF EXISTS trigger_auto_update_adaptive_weights ON outfit_match_feedback;

CREATE TRIGGER trigger_auto_update_adaptive_weights
  AFTER INSERT ON outfit_match_feedback
  FOR EACH ROW
  EXECUTE FUNCTION auto_update_adaptive_weights();

-- Create analytics view for adaptive learning metrics
CREATE OR REPLACE VIEW adaptive_learning_analytics AS
SELECT
  sp.user_id,
  sp.archetype,
  sp.adaptive_archetype_weights,
  sp.total_feedback_count,
  sp.last_weight_update,
  sp.learning_enabled,
  COUNT(omf.id) as recent_feedback_count,
  AVG(CASE WHEN omf.liked THEN 1 ELSE 0 END) as recent_like_rate,
  sp.created_at as profile_created_at,
  EXTRACT(EPOCH FROM (now() - sp.created_at)) / 86400 as days_since_profile_creation
FROM style_profiles sp
LEFT JOIN outfit_match_feedback omf
  ON omf.user_id = sp.user_id
  AND omf.created_at > (now() - INTERVAL '7 days')
WHERE sp.learning_enabled = true
GROUP BY sp.user_id, sp.archetype, sp.adaptive_archetype_weights, sp.total_feedback_count,
         sp.last_weight_update, sp.learning_enabled, sp.created_at;

-- Grant access to authenticated users
GRANT SELECT ON adaptive_learning_analytics TO authenticated;