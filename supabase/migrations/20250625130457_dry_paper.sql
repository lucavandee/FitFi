/*
  # Create outfits table

  1. New Tables
    - `outfits`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `match_percentage` (integer)
      - `image_url` (text)
      - `tags` (text array)
      - `occasions` (text array)
      - `explanation` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  2. Security
    - Enable RLS on `outfits` table
    - Add policy for all users to read outfits
*/

CREATE TABLE IF NOT EXISTS outfits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  match_percentage integer DEFAULT 85,
  image_url text,
  tags text[] DEFAULT '{}',
  occasions text[] DEFAULT '{}',
  explanation text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE outfits ENABLE ROW LEVEL SECURITY;

-- Policy for all users to read outfits
CREATE POLICY "All users can read outfits"
  ON outfits
  FOR SELECT
  TO authenticated
  USING (true);