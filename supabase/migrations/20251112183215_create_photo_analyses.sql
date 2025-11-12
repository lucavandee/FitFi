/*
  # Photo Analysis System

  1. New Tables
    - `photo_analyses`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `photo_url` (text, URL to stored photo)
      - `analysis_result` (jsonb, AI analysis data)
      - `feedback` (text, Nova's feedback message)
      - `detected_items` (text[], list of detected clothing items)
      - `detected_colors` (text[], list of detected colors)
      - `detected_style` (text, detected style archetype)
      - `match_score` (integer, 0-100 how well it matches user profile)
      - `suggestions` (text[], improvement suggestions)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Storage
    - Create `outfit-photos` bucket for user uploads

  3. Security
    - Enable RLS on `photo_analyses` table
    - Users can only read/write their own analyses
    - Storage policies for photo uploads
*/

-- Create photo_analyses table
CREATE TABLE IF NOT EXISTS photo_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  photo_url text NOT NULL,
  analysis_result jsonb DEFAULT '{}'::jsonb,
  feedback text,
  detected_items text[] DEFAULT ARRAY[]::text[],
  detected_colors text[] DEFAULT ARRAY[]::text[],
  detected_style text,
  match_score integer DEFAULT 0 CHECK (match_score >= 0 AND match_score <= 100),
  suggestions text[] DEFAULT ARRAY[]::text[],
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE photo_analyses ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own photo analyses"
  ON photo_analyses
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own photo analyses"
  ON photo_analyses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own photo analyses"
  ON photo_analyses
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own photo analyses"
  ON photo_analyses
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create storage bucket for outfit photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('outfit-photos', 'outfit-photos', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for outfit-photos bucket
CREATE POLICY "Users can upload own outfit photos"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'outfit-photos' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view own outfit photos"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'outfit-photos' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete own outfit photos"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'outfit-photos' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS photo_analyses_user_id_idx ON photo_analyses(user_id);
CREATE INDEX IF NOT EXISTS photo_analyses_created_at_idx ON photo_analyses(created_at DESC);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_photo_analyses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_photo_analyses_updated_at
  BEFORE UPDATE ON photo_analyses
  FOR EACH ROW
  EXECUTE FUNCTION update_photo_analyses_updated_at();
