/*
  # Fix Calibration Table and Add RPC Functions
  
  1. Table Updates
    - Add missing columns to outfit_calibration_feedback
    - Add response_time_ms, dominant_colors, occasion
  
  2. Functions
    - Add compute_calibration_adjustments
    - Add apply_calibration_to_profile
    - Add get_calibration_effectiveness
  
  3. Security
    - All functions use SECURITY DEFINER for proper access
*/

-- Add missing columns if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'outfit_calibration_feedback' 
    AND column_name = 'response_time_ms'
  ) THEN
    ALTER TABLE outfit_calibration_feedback 
    ADD COLUMN response_time_ms int DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'outfit_calibration_feedback' 
    AND column_name = 'dominant_colors'
  ) THEN
    ALTER TABLE outfit_calibration_feedback 
    ADD COLUMN dominant_colors text[];
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'outfit_calibration_feedback' 
    AND column_name = 'occasion'
  ) THEN
    ALTER TABLE outfit_calibration_feedback 
    ADD COLUMN occasion text;
  END IF;
END $$;

-- Create RPC functions
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
  FOR v_feedback_record IN
    SELECT
      outfit_archetypes,
      feedback,
      COALESCE(response_time_ms, 1000) as response_time_ms
    FROM outfit_calibration_feedback
    WHERE
      (p_user_id IS NOT NULL AND user_id = p_user_id) OR
      (p_session_id IS NOT NULL AND session_id = p_session_id)
  LOOP
    IF v_feedback_record.feedback = 'spot_on' THEN
      v_boost := 0.15 + (2000.0 - LEAST(v_feedback_record.response_time_ms, 2000)) / 2000.0 * 0.10;

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
  END LOOP;

  RETURN v_adjustments;
END;
$$;

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
  v_adjustments := compute_calibration_adjustments(p_user_id, p_session_id);

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

  IF v_current_embedding IS NULL OR v_current_embedding = '{}'::jsonb THEN
    v_current_embedding := '{}'::jsonb;
  END IF;

  FOR v_archetype, v_adjustment_value IN
    SELECT * FROM jsonb_each_text(v_adjustments)
  LOOP
    v_current_value := COALESCE((v_current_embedding->>v_archetype)::numeric, 50.0);
    v_new_value := v_current_value + (v_adjustment_value::numeric * 100.0);
    v_new_value := GREATEST(0.0, LEAST(100.0, v_new_value));

    v_current_embedding := jsonb_set(
      v_current_embedding,
      ARRAY[v_archetype],
      to_jsonb(ROUND(v_new_value, 2))
    );
  END LOOP;

  IF p_user_id IS NOT NULL THEN
    UPDATE style_profiles
    SET
      visual_preference_embedding = v_current_embedding,
      last_calibration_at = now(),
      updated_at = now()
    WHERE user_id = p_user_id;
  ELSIF p_session_id IS NOT NULL THEN
    UPDATE style_profiles
    SET
      visual_preference_embedding = v_current_embedding,
      last_calibration_at = now(),
      updated_at = now()
    WHERE session_id = p_session_id;
  END IF;
END;
$$;

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
    ROUND(AVG(COALESCE(response_time_ms, 1000))::numeric, 0) as avg_response_time,
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
