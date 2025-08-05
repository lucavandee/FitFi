/*
  # Alt Text Cache Table

  1. New Tables
    - `alt_cache`
      - `id` (uuid, primary key)
      - `image_url` (text, unique)
      - `alt_text` (text)
      - `context` (text)
      - `created_at` (timestamp)
  2. Security
    - Enable RLS on `alt_cache` table
    - Add policy for public read access
    - Add policy for service role write access
*/

CREATE TABLE IF NOT EXISTS alt_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text UNIQUE NOT NULL,
  alt_text text NOT NULL,
  context text DEFAULT 'general',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE alt_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read alt cache"
  ON alt_cache
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Service role can write alt cache"
  ON alt_cache
  FOR INSERT
  TO service_role
  USING (true);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_alt_cache_image_url ON alt_cache(image_url);