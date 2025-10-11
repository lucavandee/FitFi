/*
  # Style Embedding Lock System

  1. Purpose
    - Lock finalized style embedding after quiz + swipes + calibration
    - Provide immutable vector for outfit generation
    - Track embedding evolution over time
    - Enable A/B testing and quality metrics

  2. New Tables
    - `style_embedding_snapshots` - Versioned embeddings over time
    - Extends `style_profiles` with lock status and metadata

  3. Philosophy
    Style embeddings should be:
    - **Stable** - Not change randomly between sessions
    - **Versioned** - Track how preferences evolve
    - **Transparent** - Users can see what influences recommendations
    - **Auditable** - Know why certain outfits were recommended

  4. Flow
    Quiz → Swipes → Calibration → LOCK EMBEDDING → Generate Outfits (fixed vector)
*/

-- ============================================
-- EXTEND STYLE_PROFILES
-- ============================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'style_profiles' AND column_name = 'embedding_locked_at'
  ) THEN
    ALTER TABLE style_profiles
      ADD COLUMN embedding_locked_at timestamptz;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'style_profiles' AND column_name = 'embedding_version'
  ) THEN
    ALTER TABLE style_profiles
      ADD COLUMN embedding_version int DEFAULT 1;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'style_profiles' AND column_name = 'locked_embedding'
  ) THEN
    ALTER TABLE style_profiles
      ADD COLUMN locked_embedding jsonb;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'style_profiles' AND column_name = 'embedding_sources'
  ) THEN
    ALTER TABLE style_profiles
      ADD COLUMN embedding_sources jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

COMMENT ON COLUMN style_profiles.embedding_locked_at IS 'When style embedding was finalized (after calibration)';
COMMENT ON COLUMN style_profiles.embedding_version IS 'Version number for tracking embedding evolution';
COMMENT ON COLUMN style_profiles.locked_embedding IS 'Immutable final embedding used for outfit generation';
COMMENT ON COLUMN style_profiles.embedding_sources IS 'Breakdown of what influenced final embedding: quiz_weight, swipes_weight, calibration_weight';

CREATE INDEX IF NOT EXISTS idx_style_profiles_locked
  ON style_profiles(embedding_locked_at) WHERE embedding_locked_at IS NOT NULL;

-- ============================================
-- STYLE EMBEDDING SNAPSHOTS
-- ============================================

CREATE TABLE IF NOT EXISTS style_embedding_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text,
  style_profile_id uuid REFERENCES style_profiles(id) ON DELETE CASCADE,
  version int NOT NULL,
  embedding jsonb NOT NULL,
  sources jsonb NOT NULL,
  snapshot_trigger text NOT NULL CHECK (snapshot_trigger IN ('quiz_complete', 'swipes_complete', 'calibration_complete', 'manual_update')),
  created_at timestamptz DEFAULT now()
);

COMMENT ON TABLE style_embedding_snapshots IS 'Historical snapshots of style embeddings - tracks how user preferences evolve';
COMMENT ON COLUMN style_embedding_snapshots.snapshot_trigger IS 'What triggered this snapshot: quiz_complete, swipes_complete, calibration_complete, manual_update';
COMMENT ON COLUMN style_embedding_snapshots.sources IS 'Breakdown: { quiz: 0.4, swipes: 0.35, calibration: 0.25 }';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_embedding_snapshots_user_id
  ON style_embedding_snapshots(user_id) WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_embedding_snapshots_profile_id
  ON style_embedding_snapshots(style_profile_id);

CREATE INDEX IF NOT EXISTS idx_embedding_snapshots_created_at
  ON style_embedding_snapshots(created_at DESC);

-- Enable RLS
ALTER TABLE style_embedding_snapshots ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own snapshots
CREATE POLICY "Users can read own embedding snapshots"
  ON style_embedding_snapshots FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Anonymous users can read by session_id
CREATE POLICY "Anonymous users read snapshots by session"
  ON style_embedding_snapshots FOR SELECT
  TO anon
  USING (session_id IS NOT NULL);

-- ============================================
-- COMPUTE FINAL EMBEDDING
-- ============================================

CREATE OR REPLACE FUNCTION compute_final_embedding(
  p_user_id uuid DEFAULT NULL,
  p_session_id text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_profile RECORD;
  v_quiz_archetype text;
  v_visual_embedding jsonb;
  v_calibration_adjustments jsonb;
  v_final_embedding jsonb := '{}'::jsonb;
  v_archetype text;
  v_quiz_score numeric := 60.0; -- Base quiz archetype starts at 60
  v_visual_score numeric;
  v_calibration_score numeric;
  v_final_score numeric;
BEGIN
  -- Get profile data
  IF p_user_id IS NOT NULL THEN
    SELECT * INTO v_profile
    FROM style_profiles
    WHERE user_id = p_user_id
    ORDER BY created_at DESC
    LIMIT 1;
  ELSIF p_session_id IS NOT NULL THEN
    SELECT * INTO v_profile
    FROM style_profiles
    WHERE session_id = p_session_id
    ORDER BY created_at DESC
    LIMIT 1;
  ELSE
    RETURN '{}'::jsonb;
  END IF;

  IF NOT FOUND THEN
    RETURN '{}'::jsonb;
  END IF;

  -- Start with quiz archetype (40% weight)
  v_quiz_archetype := v_profile.archetype;
  v_final_embedding := jsonb_build_object(v_quiz_archetype, v_quiz_score);

  -- Add visual preferences (35% weight)
  v_visual_embedding := v_profile.visual_preference_embedding;
  IF v_visual_embedding IS NOT NULL AND v_visual_embedding != '{}'::jsonb THEN
    FOR v_archetype, v_visual_score IN
      SELECT * FROM jsonb_each_text(v_visual_embedding)
    LOOP
      IF v_final_embedding ? v_archetype THEN
        v_final_score := COALESCE((v_final_embedding->>v_archetype)::numeric, 0) * 0.4
                       + v_visual_score::numeric * 0.35;
      ELSE
        v_final_score := v_visual_score::numeric * 0.35;
      END IF;

      v_final_embedding := jsonb_set(
        v_final_embedding,
        ARRAY[v_archetype],
        to_jsonb(v_final_score)
      );
    END LOOP;
  END IF;

  -- Apply calibration adjustments (25% weight)
  v_calibration_adjustments := compute_calibration_adjustments(p_user_id, p_session_id);
  IF v_calibration_adjustments IS NOT NULL AND v_calibration_adjustments != '{}'::jsonb THEN
    FOR v_archetype, v_calibration_score IN
      SELECT * FROM jsonb_each_text(v_calibration_adjustments)
    LOOP
      v_final_score := COALESCE((v_final_embedding->>v_archetype)::numeric, 50.0)
                     + (v_calibration_score::numeric * 100.0 * 0.25);

      -- Clamp between 0 and 100
      v_final_score := GREATEST(0.0, LEAST(100.0, v_final_score));

      v_final_embedding := jsonb_set(
        v_final_embedding,
        ARRAY[v_archetype],
        to_jsonb(ROUND(v_final_score, 2))
      );
    END LOOP;
  END IF;

  -- Normalize to ensure all scores are 0-100 and sum makes sense
  DECLARE
    v_max_score numeric := 0;
  BEGIN
    FOR v_archetype, v_final_score IN
      SELECT * FROM jsonb_each_text(v_final_embedding)
    LOOP
      IF v_final_score::numeric > v_max_score THEN
        v_max_score := v_final_score::numeric;
      END IF;
    END LOOP;

    -- Normalize relative to max
    IF v_max_score > 0 THEN
      FOR v_archetype, v_final_score IN
        SELECT * FROM jsonb_each_text(v_final_embedding)
      LOOP
        v_final_embedding := jsonb_set(
          v_final_embedding,
          ARRAY[v_archetype],
          to_jsonb(ROUND((v_final_score::numeric / v_max_score * 100.0)::numeric, 2))
        );
      END LOOP;
    END IF;
  END;

  RETURN v_final_embedding;
END;
$$;

COMMENT ON FUNCTION compute_final_embedding IS 'Computes final style embedding from quiz (40%) + swipes (35%) + calibration (25%)';

-- ============================================
-- LOCK EMBEDDING
-- ============================================

CREATE OR REPLACE FUNCTION lock_style_embedding(
  p_user_id uuid DEFAULT NULL,
  p_session_id text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_final_embedding jsonb;
  v_profile_id uuid;
  v_current_version int;
BEGIN
  -- Compute final embedding
  v_final_embedding := compute_final_embedding(p_user_id, p_session_id);

  IF v_final_embedding = '{}'::jsonb THEN
    RAISE EXCEPTION 'Cannot lock embedding: no profile data found';
  END IF;

  -- Get profile ID and current version
  IF p_user_id IS NOT NULL THEN
    SELECT id, COALESCE(embedding_version, 0) INTO v_profile_id, v_current_version
    FROM style_profiles
    WHERE user_id = p_user_id
    ORDER BY created_at DESC
    LIMIT 1;
  ELSIF p_session_id IS NOT NULL THEN
    SELECT id, COALESCE(embedding_version, 0) INTO v_profile_id, v_current_version
    FROM style_profiles
    WHERE session_id = p_session_id
    ORDER BY created_at DESC
    LIMIT 1;
  ELSE
    RAISE EXCEPTION 'Either user_id or session_id must be provided';
  END IF;

  -- Lock embedding in profile
  UPDATE style_profiles
  SET
    locked_embedding = v_final_embedding,
    embedding_locked_at = now(),
    embedding_version = v_current_version + 1,
    embedding_sources = jsonb_build_object(
      'quiz_weight', 0.40,
      'swipes_weight', 0.35,
      'calibration_weight', 0.25,
      'locked_at', now()
    ),
    updated_at = now()
  WHERE id = v_profile_id;

  -- Create snapshot
  INSERT INTO style_embedding_snapshots (
    user_id,
    session_id,
    style_profile_id,
    version,
    embedding,
    sources,
    snapshot_trigger
  ) VALUES (
    p_user_id,
    CASE WHEN p_user_id IS NULL THEN p_session_id ELSE NULL END,
    v_profile_id,
    v_current_version + 1,
    v_final_embedding,
    jsonb_build_object(
      'quiz', 0.40,
      'swipes', 0.35,
      'calibration', 0.25
    ),
    'calibration_complete'
  );

  RETURN v_final_embedding;
END;
$$;

COMMENT ON FUNCTION lock_style_embedding IS 'Locks final style embedding after calibration - creates immutable vector for outfit generation';

-- ============================================
-- ANALYTICS FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION get_embedding_stability(
  p_user_id uuid
)
RETURNS TABLE (
  version int,
  created_at timestamptz,
  embedding jsonb,
  stability_score numeric
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  WITH snapshots AS (
    SELECT
      version,
      created_at,
      embedding,
      LAG(embedding) OVER (ORDER BY version) as prev_embedding
    FROM style_embedding_snapshots
    WHERE user_id = p_user_id
    ORDER BY version
  )
  SELECT
    version,
    created_at,
    embedding,
    CASE
      WHEN prev_embedding IS NULL THEN 1.0
      ELSE (
        -- Simple stability metric: count unchanged archetypes / total
        SELECT COUNT(*)::numeric / GREATEST(
          (SELECT COUNT(*) FROM jsonb_object_keys(embedding)),
          1
        )
        FROM jsonb_object_keys(embedding) k
        WHERE ABS(COALESCE((embedding->>k)::numeric, 0) -
                  COALESCE((prev_embedding->>k)::numeric, 0)) < 10
      )
    END as stability_score
  FROM snapshots;
$$;

COMMENT ON FUNCTION get_embedding_stability IS 'Track how stable user preferences are over time (1.0 = very stable, 0.0 = completely changed)';
