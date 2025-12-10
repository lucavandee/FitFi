/*
  # Testimonials System

  1. New Tables
    - `testimonials`
      - `id` (uuid, primary key)
      - `quote` (text) - De testimonial tekst
      - `author_name` (text) - Naam van de klant
      - `author_age` (integer, nullable) - Leeftijd
      - `author_avatar_url` (text, nullable) - URL naar avatar (optioneel)
      - `rating` (integer) - Rating 1-5 sterren
      - `is_verified` (boolean) - Geverifieerde klant?
      - `is_active` (boolean) - Tonen op homepage?
      - `display_order` (integer) - Volgorde waarin testimonials getoond worden
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `created_by` (uuid, foreign key to auth.users) - Admin die het heeft toegevoegd

  2. Security
    - Enable RLS on `testimonials` table
    - Public read access for active testimonials
    - Admin-only write access

  3. Indexes
    - Index on `is_active` and `display_order` for efficient querying
*/

CREATE TABLE IF NOT EXISTS testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote text NOT NULL,
  author_name text NOT NULL,
  author_age integer,
  author_avatar_url text,
  rating integer NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  is_verified boolean DEFAULT false,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Public can read active testimonials
CREATE POLICY "Anyone can view active testimonials"
  ON testimonials
  FOR SELECT
  USING (is_active = true);

-- Admins can view all testimonials
CREATE POLICY "Admins can view all testimonials"
  ON testimonials
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Admins can insert testimonials
CREATE POLICY "Admins can insert testimonials"
  ON testimonials
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Admins can update testimonials
CREATE POLICY "Admins can update testimonials"
  ON testimonials
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Admins can delete testimonials
CREATE POLICY "Admins can delete testimonials"
  ON testimonials
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Index for efficient querying
CREATE INDEX IF NOT EXISTS idx_testimonials_active_order 
  ON testimonials(is_active, display_order) 
  WHERE is_active = true;

-- Auto-update timestamp
CREATE OR REPLACE FUNCTION update_testimonials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER testimonials_updated_at
  BEFORE UPDATE ON testimonials
  FOR EACH ROW
  EXECUTE FUNCTION update_testimonials_updated_at();
