/*
  # Visual Preference Engine - Core Tables

  1. New Tables
    - `mood_photos`
      - Curated photos for swipe-based preference discovery
      - Links to archetype weights and dominant colors
    
    - `style_swipes`
      - Records user swipe actions (like/dislike)
      - Session-based tracking for coherent learning
      - Links to mood_photos for pattern analysis
    
    - `style_profiles` extensions
      - Adds visual_preference_embedding (JSONB archetype scores)
      - Adds swipe_session_completed flag
      - Adds embedding_version for A/B testing
  
  2. Security
    - Enable RLS on all tables
    - Users can only read/write their own swipes
    - mood_photos are publicly readable (curated content)
  
  3. Notes
    - Swipe data is append-only (no updates/deletes)
    - Embeddings are computed from swipe patterns
    - Session tracking allows multi-session learning
*/

-- Create mood_photos table (curated content)
CREATE TABLE IF NOT EXISTS mood_photos (
  id BIGSERIAL PRIMARY KEY,
  image_url TEXT NOT NULL,
  archetype_weights JSONB NOT NULL DEFAULT '{}',
  dominant_colors TEXT[] DEFAULT ARRAY[]::TEXT[],
  mood_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  style_attributes JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE mood_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Mood photos are publicly readable"
  ON mood_photos FOR SELECT
  TO authenticated
  USING (true);

-- Create style_swipes table (user interactions)
CREATE TABLE IF NOT EXISTS style_swipes (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  photo_id BIGINT REFERENCES mood_photos(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('left', 'right')),
  swipe_order INTEGER NOT NULL,
  response_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE style_swipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own swipes"
  ON style_swipes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own swipes"
  ON style_swipes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Add visual preference fields to style_profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'style_profiles' AND column_name = 'visual_preference_embedding'
  ) THEN
    ALTER TABLE style_profiles ADD COLUMN visual_preference_embedding JSONB DEFAULT '{}';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'style_profiles' AND column_name = 'swipe_session_completed'
  ) THEN
    ALTER TABLE style_profiles ADD COLUMN swipe_session_completed BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'style_profiles' AND column_name = 'embedding_version'
  ) THEN
    ALTER TABLE style_profiles ADD COLUMN embedding_version INTEGER DEFAULT 1;
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_style_swipes_user ON style_swipes(user_id);
CREATE INDEX IF NOT EXISTS idx_style_swipes_session ON style_swipes(session_id);
CREATE INDEX IF NOT EXISTS idx_style_swipes_created ON style_swipes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mood_photos_archetype ON mood_photos USING GIN (archetype_weights);
