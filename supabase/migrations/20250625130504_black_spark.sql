/*
  # Create saved outfits table

  1. New Tables
    - `saved_outfits`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `outfit_id` (uuid, foreign key to outfits)
      - `created_at` (timestamp)
  2. Security
    - Enable RLS on `saved_outfits` table
    - Add policy for users to read/update their own saved outfits
*/

CREATE TABLE IF NOT EXISTS saved_outfits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  outfit_id uuid REFERENCES outfits(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, outfit_id)
);

ALTER TABLE saved_outfits ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own saved outfits
CREATE POLICY "Users can read own saved outfits"
  ON saved_outfits
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy for users to insert their own saved outfits
CREATE POLICY "Users can insert own saved outfits"
  ON saved_outfits
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to delete their own saved outfits
CREATE POLICY "Users can delete own saved outfits"
  ON saved_outfits
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);