/*
  # Create Preview Outfits Table

  1. New Tables
    - `preview_outfits`
      - `id` (uuid, primary key) - Unieke identifier
      - `user_id` (uuid, foreign key) - Link naar gebruiker
      - `session_id` (text, nullable) - Quiz sessie identifier
      - `outfit_data` (jsonb) - De outfit items (top, bottom, footwear)
      - `style_archetype` (text) - Hoofdstijl (minimal, classic, etc.)
      - `confidence` (numeric) - Confidence score (0.0 - 1.0)
      - `swipe_count` (integer) - Bij welke swipe dit was opgeslagen
      - `created_at` (timestamptz) - Wanneer opgeslagen

  2. Security
    - Enable RLS on `preview_outfits` table
    - Users can only see/create their own preview outfits
    - Users can update/delete their own preview outfits

  3. Indexes
    - Index on user_id for fast user queries
    - Index on session_id for session lookups
    - Index on created_at for recent outfits
*/

-- Create preview_outfits table
CREATE TABLE IF NOT EXISTS preview_outfits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_id text,
  outfit_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  style_archetype text NOT NULL DEFAULT 'minimal',
  confidence numeric NOT NULL DEFAULT 0.5 CHECK (confidence >= 0 AND confidence <= 1),
  swipe_count integer NOT NULL DEFAULT 5,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE preview_outfits ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_preview_outfits_user_id
  ON preview_outfits(user_id);

CREATE INDEX IF NOT EXISTS idx_preview_outfits_session_id
  ON preview_outfits(session_id);

CREATE INDEX IF NOT EXISTS idx_preview_outfits_created_at
  ON preview_outfits(created_at DESC);

-- RLS Policies

-- Users can view their own preview outfits
CREATE POLICY "Users can view own preview outfits"
  ON preview_outfits
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own preview outfits
CREATE POLICY "Users can insert own preview outfits"
  ON preview_outfits
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own preview outfits
CREATE POLICY "Users can update own preview outfits"
  ON preview_outfits
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own preview outfits
CREATE POLICY "Users can delete own preview outfits"
  ON preview_outfits
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Comment on table
COMMENT ON TABLE preview_outfits IS 'Stores preview outfits generated during the visual preference quiz';
COMMENT ON COLUMN preview_outfits.outfit_data IS 'JSONB containing top, bottom, footwear items with colors and styles';
COMMENT ON COLUMN preview_outfits.confidence IS 'Confidence score from 0.0 to 1.0 based on swipe pattern';
COMMENT ON COLUMN preview_outfits.swipe_count IS 'Number of swipes completed when this preview was saved';
