/*
  # Nova Visual Preference Engine

  1. New Tables
    - `mood_photos`
      - `id` (uuid, primary key)
      - `image_url` (text) - URL to curated outfit photo
      - `style_tags` (text[]) - Style categories (e.g., 'scandi_minimal', 'italian_smart_casual')
      - `archetype_weights` (jsonb) - Weight per archetype for embedding
      - `color_palette` (text[]) - Dominant colors in the image
      - `occasion` (text) - Occasion type (casual, work, formal, etc.)
      - `season` (text) - Season (spring, summer, fall, winter, all)
      - `active` (boolean) - Whether photo is in rotation
      - `display_order` (int) - Sort order for presentation

    - `style_swipes`
      - `id` (uuid, primary key)
      - `user_id` (uuid) - FK to auth.users (nullable for anonymous)
      - `session_id` (text) - For anonymous users
      - `mood_photo_id` (uuid) - FK to mood_photos
      - `swipe_direction` (text) - 'left' (reject) or 'right' (like)
      - `response_time_ms` (int) - Time taken to swipe
      - `created_at` (timestamptz)

  2. Changes to existing tables
    - Add `visual_preference_embedding` (jsonb) to `style_profiles`
    - Add `swipe_session_completed` (boolean) to `style_profiles`

  3. Security
    - Enable RLS on both new tables
    - Allow authenticated users to manage their own swipes
    - Allow anonymous users to swipe via session_id
    - mood_photos are publicly readable

  4. Indexes
    - Fast lookups by user_id and session_id
    - GIN index on style_tags for filtering
    - Index on archetype_weights for similarity matching
*/

-- ============================================
-- 1. MOOD PHOTOS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS mood_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  style_tags text[] NOT NULL DEFAULT ARRAY[]::text[],
  archetype_weights jsonb NOT NULL DEFAULT '{}'::jsonb,
  color_palette text[] DEFAULT ARRAY[]::text[],
  occasion text,
  season text DEFAULT 'all',
  active boolean DEFAULT true,
  display_order int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

COMMENT ON TABLE mood_photos IS 'Curated outfit photos for visual preference learning';
COMMENT ON COLUMN mood_photos.style_tags IS 'Style categories: scandi_minimal, italian_smart_casual, street_refined, etc.';
COMMENT ON COLUMN mood_photos.archetype_weights IS 'Weight distribution across archetypes for embedding calculation';
COMMENT ON COLUMN mood_photos.color_palette IS 'Dominant colors in hex format';

CREATE INDEX IF NOT EXISTS idx_mood_photos_active
  ON mood_photos(active) WHERE active = true;

CREATE INDEX IF NOT EXISTS idx_mood_photos_style_tags
  ON mood_photos USING gin(style_tags);

CREATE INDEX IF NOT EXISTS idx_mood_photos_display_order
  ON mood_photos(display_order);

-- Enable RLS
ALTER TABLE mood_photos ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read active mood photos
CREATE POLICY "Public read active mood photos"
  ON mood_photos FOR SELECT
  USING (active = true);

-- ============================================
-- 2. STYLE SWIPES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS style_swipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text,
  mood_photo_id uuid REFERENCES mood_photos(id) ON DELETE CASCADE NOT NULL,
  swipe_direction text NOT NULL CHECK (swipe_direction IN ('left', 'right')),
  response_time_ms int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

COMMENT ON TABLE style_swipes IS 'User swipe interactions with mood photos for visual preference learning';
COMMENT ON COLUMN style_swipes.swipe_direction IS 'left = reject, right = like';
COMMENT ON COLUMN style_swipes.response_time_ms IS 'Time taken to make decision (indicates confidence)';

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_style_swipes_user_id
  ON style_swipes(user_id) WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_style_swipes_session_id
  ON style_swipes(session_id) WHERE session_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_style_swipes_mood_photo_id
  ON style_swipes(mood_photo_id);

CREATE INDEX IF NOT EXISTS idx_style_swipes_created_at
  ON style_swipes(created_at DESC);

-- Enable RLS
ALTER TABLE style_swipes ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can read their own swipes
CREATE POLICY "Users can read own swipes"
  ON style_swipes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Authenticated users can insert their own swipes
CREATE POLICY "Users can insert own swipes"
  ON style_swipes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Anonymous users can read by session_id
CREATE POLICY "Anonymous users read swipes by session"
  ON style_swipes FOR SELECT
  TO anon
  USING (session_id IS NOT NULL);

-- Policy: Anonymous users can insert with session_id
CREATE POLICY "Anonymous users insert swipes with session"
  ON style_swipes FOR INSERT
  TO anon
  WITH CHECK (session_id IS NOT NULL AND user_id IS NULL);

-- ============================================
-- 3. EXTEND STYLE_PROFILES TABLE
-- ============================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'style_profiles' AND column_name = 'visual_preference_embedding'
  ) THEN
    ALTER TABLE style_profiles
      ADD COLUMN visual_preference_embedding jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'style_profiles' AND column_name = 'swipe_session_completed'
  ) THEN
    ALTER TABLE style_profiles
      ADD COLUMN swipe_session_completed boolean DEFAULT false;
  END IF;
END $$;

COMMENT ON COLUMN style_profiles.visual_preference_embedding IS 'Computed embedding from swipe behavior - weighted archetype preferences';
COMMENT ON COLUMN style_profiles.swipe_session_completed IS 'Whether user completed visual swipe phase';

CREATE INDEX IF NOT EXISTS idx_style_profiles_visual_embedding
  ON style_profiles USING gin(visual_preference_embedding)
  WHERE visual_preference_embedding IS NOT NULL AND visual_preference_embedding != '{}'::jsonb;

-- ============================================
-- 4. HELPER FUNCTION: COMPUTE VISUAL EMBEDDING
-- ============================================

CREATE OR REPLACE FUNCTION compute_visual_preference_embedding(
  p_user_id uuid DEFAULT NULL,
  p_session_id text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_embedding jsonb := '{}'::jsonb;
  v_swipe_record RECORD;
  v_weight numeric;
  v_archetype text;
  v_archetype_value numeric;
BEGIN
  -- Aggregate all right-swipes with their archetype weights
  FOR v_swipe_record IN
    SELECT
      mp.archetype_weights,
      mp.style_tags,
      ss.response_time_ms
    FROM style_swipes ss
    JOIN mood_photos mp ON mp.id = ss.mood_photo_id
    WHERE
      ss.swipe_direction = 'right'
      AND (
        (p_user_id IS NOT NULL AND ss.user_id = p_user_id) OR
        (p_session_id IS NOT NULL AND ss.session_id = p_session_id)
      )
  LOOP
    -- Iterate through each archetype in the photo's weights
    FOR v_archetype, v_archetype_value IN
      SELECT * FROM jsonb_each_text(v_swipe_record.archetype_weights)
    LOOP
      -- Add to embedding (faster response = higher weight)
      v_weight := v_archetype_value::numeric * (1.0 + (3000.0 - LEAST(v_swipe_record.response_time_ms, 3000)) / 3000.0);

      IF v_embedding ? v_archetype THEN
        v_embedding := jsonb_set(
          v_embedding,
          ARRAY[v_archetype],
          to_jsonb((v_embedding->>v_archetype)::numeric + v_weight)
        );
      ELSE
        v_embedding := jsonb_set(v_embedding, ARRAY[v_archetype], to_jsonb(v_weight));
      END IF;
    END LOOP;
  END LOOP;

  -- Normalize to 0-100 scale
  IF jsonb_object_keys(v_embedding) IS NOT NULL THEN
    DECLARE
      v_max_value numeric := 0;
    BEGIN
      -- Find max value
      FOR v_archetype, v_archetype_value IN
        SELECT * FROM jsonb_each_text(v_embedding)
      LOOP
        IF v_archetype_value::numeric > v_max_value THEN
          v_max_value := v_archetype_value::numeric;
        END IF;
      END LOOP;

      -- Normalize
      IF v_max_value > 0 THEN
        FOR v_archetype, v_archetype_value IN
          SELECT * FROM jsonb_each_text(v_embedding)
        LOOP
          v_embedding := jsonb_set(
            v_embedding,
            ARRAY[v_archetype],
            to_jsonb(ROUND((v_archetype_value::numeric / v_max_value * 100)::numeric, 2))
          );
        END LOOP;
      END IF;
    END;
  END IF;

  RETURN v_embedding;
END;
$$;

COMMENT ON FUNCTION compute_visual_preference_embedding IS 'Computes weighted archetype embedding from user swipe behavior';

-- ============================================
-- 5. TRIGGER: AUTO-UPDATE VISUAL EMBEDDING
-- ============================================

CREATE OR REPLACE FUNCTION trigger_update_visual_embedding()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_embedding jsonb;
  v_profile_id uuid;
BEGIN
  -- Compute new embedding
  v_embedding := compute_visual_preference_embedding(NEW.user_id, NEW.session_id);

  -- Update the corresponding style_profile
  IF NEW.user_id IS NOT NULL THEN
    UPDATE style_profiles
    SET
      visual_preference_embedding = v_embedding,
      updated_at = now()
    WHERE user_id = NEW.user_id
    RETURNING id INTO v_profile_id;
  ELSIF NEW.session_id IS NOT NULL THEN
    UPDATE style_profiles
    SET
      visual_preference_embedding = v_embedding,
      updated_at = now()
    WHERE session_id = NEW.session_id
    RETURNING id INTO v_profile_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_update_visual_embedding ON style_swipes;
CREATE TRIGGER trigger_update_visual_embedding
  AFTER INSERT ON style_swipes
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_visual_embedding();

COMMENT ON TRIGGER trigger_update_visual_embedding ON style_swipes IS 'Auto-updates visual preference embedding after each swipe';
