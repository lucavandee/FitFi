/*
  # Create outfit items table

  1. New Tables
    - `outfit_items`
      - `id` (uuid, primary key)
      - `outfit_id` (uuid, foreign key to outfits)
      - `name` (text)
      - `brand` (text)
      - `price` (numeric)
      - `image_url` (text)
      - `url` (text)
      - `retailer` (text)
      - `category` (text)
      - `created_at` (timestamp)
  2. Security
    - Enable RLS on `outfit_items` table
    - Add policy for all users to read outfit items
*/

CREATE TABLE IF NOT EXISTS outfit_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  outfit_id uuid REFERENCES outfits(id) ON DELETE CASCADE,
  name text NOT NULL,
  brand text,
  price numeric NOT NULL,
  image_url text,
  url text,
  retailer text,
  category text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE outfit_items ENABLE ROW LEVEL SECURITY;

-- Policy for all users to read outfit items
CREATE POLICY "All users can read outfit items"
  ON outfit_items
  FOR SELECT
  TO authenticated
  USING (true);