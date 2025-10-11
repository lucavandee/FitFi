/*
  # Outfit Calibration System

  1. New Table
    - `outfit_calibration_feedback`
      - Tracks user reactions to calibration outfits
      - Records "Spot on" vs "Lijkt me niks" feedback
      - Enables immediate profile fine-tuning

  2. Purpose
    - Validate AI outfit generation before showing full results
    - Learn what users actually like vs what algorithm predicts
    - Fine-tune archetype weights in real-time
    - Reduce mismatches in final recommendations

  3. Flow
    After swipe session → Show 3 calibration outfits → Collect feedback → Adjust profile → Show results

  4. Security
    - RLS enabled
    - Users can only see/edit their own feedback
*/

CREATE TABLE IF NOT EXISTS outfit_calibration_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text,
  outfit_data jsonb NOT NULL,
  feedback text NOT NULL CHECK (feedback IN ('spot_on', 'not_for_me', 'maybe')),
  response_time_ms int DEFAULT 0,
  outfit_archetypes jsonb NOT NULL,
  dominant_colors text[],
  occasion text,
  created_at timestamptz DEFAULT now()
);

COMMENT ON TABLE outfit_calibration_feedback IS 'User feedback on calibration outfits shown after visual preference swipe';
COMMENT ON COLUMN outfit_calibration_feedback.outfit_data IS 'Full outfit JSON: top, bottom, shoes, accessories';
COMMENT ON COLUMN outfit_calibration_feedback.feedback IS 'User reaction: spot_on (love it), not_for_me (dislike), maybe (neutral)';
COMMENT ON COLUMN outfit_calibration_feedback.outfit_archetypes IS 'Archetype weights used to generate this outfit';
COMMENT ON COLUMN outfit_calibration_feedback.dominant_colors IS 'Main colors in the outfit';
COMMENT ON COLUMN outfit_calibration_feedback.response_time_ms IS 'How fast user made decision (confidence indicator)';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_outfit_calibration_user_id
  ON outfit_calibration_feedback(user_id) WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_outfit_calibration_session_id
  ON outfit_calibration_feedback(session_id) WHERE session_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_outfit_calibration_feedback_type
  ON outfit_calibration_feedback(feedback);

CREATE INDEX IF NOT EXISTS idx_outfit_calibration_created_at
  ON outfit_calibration_feedback(created_at DESC);

-- Enable RLS
ALTER TABLE outfit_calibration_feedback ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can read their own feedback
CREATE POLICY "Users can read own calibration feedback"
  ON outfit_calibration_feedback FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Authenticated users can insert their own feedback
CREATE POLICY "Users can insert own calibration feedback"
  ON outfit_calibration_feedback FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Anonymous users can read by session_id
CREATE POLICY "Anonymous users read calibration by session"
  ON outfit_calibration_feedback FOR SELECT
  TO anon
  USING (session_id IS NOT NULL);

-- Policy: Anonymous users can insert with session_id
CREATE POLICY "Anonymous users insert calibration with session"
  ON outfit_calibration_feedback FOR INSERT
  TO anon
  WITH CHECK (session_id IS NOT NULL AND user_id IS NULL);

-- ============================================
-- PROFILE FINE-TUNING FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION compute_calibration_adjustments(
  p_user_id uuid DEFAULT NULL,
  p_session_id text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_adjustments jsonb := '{}'::jsonb;
  v_feedback_record RECORD;
  v_archetype text;
  v_archetype_value numeric;
  v_boost numeric;
  v_penalty numeric;
BEGIN
  -- Iterate through all calibration feedback
  FOR v_feedback_record IN
    SELECT
      outfit_archetypes,
      feedback,
      response_time_ms
    FROM outfit_calibration_feedback
    WHERE
      (p_user_id IS NOT NULL AND user_id = p_user_id) OR
      (p_session_id IS NOT NULL AND session_id = p_session_id)
  LOOP
    -- Calculate boost/penalty based on feedback
    IF v_feedback_record.feedback = 'spot_on' THEN
      -- Fast response = high confidence = bigger boost
      v_boost := 0.15 + (2000.0 - LEAST(v_feedback_record.response_time_ms, 2000)) / 2000.0 * 0.10;

      -- Boost all archetypes in liked outfit
      FOR v_archetype, v_archetype_value IN
        SELECT * FROM jsonb_each_text(v_feedback_record.outfit_archetypes)
      LOOP
        IF v_adjustments ? v_archetype THEN
          v_adjustments := jsonb_set(
            v_adjustments,
            ARRAY[v_archetype],
            to_jsonb((v_adjustments->>v_archetype)::numeric + (v_archetype_value::numeric * v_boost))
          );
        ELSE
          v_adjustments := jsonb_set(
            v_adjustments,
            ARRAY[v_archetype],
            to_jsonb(v_archetype_value::numeric * v_boost)
          );
        END IF;
      END LOOP;

    ELSIF v_feedback_record.feedback = 'not_for_me' THEN
      -- Penalty for disliked outfit (smaller than boost to avoid over-correction)
      v_penalty := -0.10;

      FOR v_archetype, v_archetype_value IN
        SELECT * FROM jsonb_each_text(v_feedback_record.outfit_archetypes)
      LOOP
        IF v_adjustments ? v_archetype THEN
          v_adjustments := jsonb_set(
            v_adjustments,
            ARRAY[v_archetype],
            to_jsonb((v_adjustments->>v_archetype)::numeric + (v_archetype_value::numeric * v_penalty))
          );
        ELSE
          v_adjustments := jsonb_set(
            v_adjustments,
            ARRAY[v_archetype],
            to_jsonb(v_archetype_value::numeric * v_penalty)
          );
        END IF;
      END LOOP;
    END IF;
    -- 'maybe' feedback = no adjustment
  END LOOP;

  RETURN v_adjustments;
END;
$$;

COMMENT ON FUNCTION compute_calibration_adjustments IS 'Computes archetype adjustments based on calibration feedback. Positive = boost liked styles, negative = reduce disliked styles.';

-- ============================================
-- APPLY CALIBRATION TO PROFILE
-- ============================================

CREATE OR REPLACE FUNCTION apply_calibration_to_profile(
  p_user_id uuid DEFAULT NULL,
  p_session_id text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_adjustments jsonb;
  v_current_embedding jsonb;
  v_archetype text;
  v_adjustment_value numeric;
  v_current_value numeric;
  v_new_value numeric;
BEGIN
  -- Get calibration adjustments
  v_adjustments := compute_calibration_adjustments(p_user_id, p_session_id);

  -- Get current visual preference embedding
  IF p_user_id IS NOT NULL THEN
    SELECT visual_preference_embedding INTO v_current_embedding
    FROM style_profiles
    WHERE user_id = p_user_id
    ORDER BY created_at DESC
    LIMIT 1;
  ELSIF p_session_id IS NOT NULL THEN
    SELECT visual_preference_embedding INTO v_current_embedding
    FROM style_profiles
    WHERE session_id = p_session_id
    ORDER BY created_at DESC
    LIMIT 1;
  ELSE
    RETURN;
  END IF;

  -- If no embedding exists, use adjustments as base
  IF v_current_embedding IS NULL OR v_current_embedding = '{}'::jsonb THEN
    v_current_embedding := '{}'::jsonb;
  END IF;

  -- Apply adjustments
  FOR v_archetype, v_adjustment_value IN
    SELECT * FROM jsonb_each_text(v_adjustments)
  LOOP
    v_current_value := COALESCE((v_current_embedding->>v_archetype)::numeric, 50.0);
    v_new_value := v_current_value + (v_adjustment_value::numeric * 100.0);

    -- Clamp between 0 and 100
    v_new_value := GREATEST(0.0, LEAST(100.0, v_new_value));

    v_current_embedding := jsonb_set(
      v_current_embedding,
      ARRAY[v_archetype],
      to_jsonb(ROUND(v_new_value, 2))
    );
  END LOOP;

  -- Update profile
  IF p_user_id IS NOT NULL THEN
    UPDATE style_profiles
    SET
      visual_preference_embedding = v_current_embedding,
      updated_at = now()
    WHERE user_id = p_user_id;
  ELSIF p_session_id IS NOT NULL THEN
    UPDATE style_profiles
    SET
      visual_preference_embedding = v_current_embedding,
      updated_at = now()
    WHERE session_id = p_session_id;
  END IF;
END;
$$;

COMMENT ON FUNCTION apply_calibration_to_profile IS 'Applies calibration feedback adjustments to user style profile. Called after all 3 calibration outfits are rated.';

-- ============================================
-- ANALYTICS FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION get_calibration_effectiveness()
RETURNS TABLE (
  feedback_type text,
  total_count bigint,
  avg_response_time numeric,
  most_common_archetype text
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    feedback,
    COUNT(*) as total_count,
    ROUND(AVG(response_time_ms)::numeric, 0) as avg_response_time,
    (
      SELECT archetype
      FROM (
        SELECT
          jsonb_object_keys(outfit_archetypes) as archetype,
          COUNT(*) as cnt
        FROM outfit_calibration_feedback ocf2
        WHERE ocf2.feedback = ocf.feedback
        GROUP BY archetype
        ORDER BY cnt DESC
        LIMIT 1
      ) sub
    ) as most_common_archetype
  FROM outfit_calibration_feedback ocf
  GROUP BY feedback
  ORDER BY total_count DESC;
$$;

COMMENT ON FUNCTION get_calibration_effectiveness IS 'Analytics: Which calibration outfits get which feedback?';
