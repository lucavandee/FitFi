/*
  # Create products table

  1. New Tables
    - `products`
      - `id` (uuid, primary key)
      - `name` (text)
      - `brand` (text)
      - `price` (numeric)
      - `original_price` (numeric)
      - `image_url` (text)
      - `retailer` (text)
      - `url` (text)
      - `category` (text)
      - `description` (text)
      - `sizes` (text array)
      - `colors` (text array)
      - `in_stock` (boolean)
      - `rating` (numeric)
      - `review_count` (integer)
      - `tags` (text array)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  2. Security
    - Enable RLS on `products` table
    - Add policy for all users to read products
*/

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  brand text,
  price numeric NOT NULL,
  original_price numeric,
  image_url text,
  retailer text,
  url text,
  category text,
  description text,
  sizes text[] DEFAULT '{}',
  colors text[] DEFAULT '{}',
  in_stock boolean DEFAULT true,
  rating numeric,
  review_count integer,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policy for all users to read products
CREATE POLICY "All users can read products"
  ON products
  FOR SELECT
  TO authenticated
  USING (true);