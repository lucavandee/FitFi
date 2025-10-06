-- Create Style Profiles Table
-- This table stores user style quiz results and generated outfit recommendations

CREATE TABLE IF NOT EXISTS style_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text,
  archetype text NOT NULL,
  color_profile jsonb NOT NULL,
  quiz_answers jsonb NOT NULL,
  generated_outfits jsonb DEFAULT '[]'::jsonb,
  favorite_outfit_ids text[] DEFAULT ARRAY[]::text[],
  completed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS style_profiles_user_id_idx ON style_profiles(user_id);
CREATE INDEX IF NOT EXISTS style_profiles_session_id_idx ON style_profiles(session_id);

-- Enable RLS
ALTER TABLE style_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profiles
CREATE POLICY "Users can read own profiles"
  ON style_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own profiles
CREATE POLICY "Users can insert own profiles"
  ON style_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own profiles
CREATE POLICY "Users can update own profiles"
  ON style_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Anonymous users can read by session_id
CREATE POLICY "Anonymous users read by session"
  ON style_profiles FOR SELECT
  TO anon
  USING (session_id IS NOT NULL);

-- Policy: Anonymous users can insert with session_id
CREATE POLICY "Anonymous users insert with session"
  ON style_profiles FOR INSERT
  TO anon
  WITH CHECK (session_id IS NOT NULL AND user_id IS NULL);

-- Policy: Anonymous users can update by session_id
CREATE POLICY "Anonymous users update by session"
  ON style_profiles FOR UPDATE
  TO anon
  USING (session_id IS NOT NULL AND user_id IS NULL)
  WITH CHECK (session_id IS NOT NULL AND user_id IS NULL);
