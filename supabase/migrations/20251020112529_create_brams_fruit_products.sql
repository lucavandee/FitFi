/*
  # Brams Fruit Products Database

  1. New Tables
    - `brams_fruit_products`
      - `id` (uuid, primary key) - Internal database ID
      - `product_id` (text) - External product ID from Brams system
      - `style_code` (text, indexed) - Style code (e.g., "900", "919")
      - `parent_id` (text) - Parent product grouping ID
      - `department` (text) - Department (e.g., "Menswear")
      - `category` (text) - Main category (e.g., "Outerwear", "Shirting")
      - `sub_category` (text) - Sub category (e.g., "Jackets", "T-Shirts")
      - `product_name` (text) - Full product name
      - `material_composition` (text) - Material description
      - `barcode` (text) - Product barcode/EAN
      - `gender` (text) - Gender (e.g., "Male", "Female")
      - `color_family` (text) - Color family grouping
      - `color` (text) - Specific color name
      - `size` (text) - Size (S, M, L, XL, etc.)
      - `country_of_origin` (text) - Manufacturing country
      - `sku` (text, unique, indexed) - Stock Keeping Unit
      - `hs_code` (text) - Harmonized System code for customs
      - `is_pack` (boolean) - Whether it's a multi-pack
      - `wholesale_price` (numeric) - Wholesale price
      - `retail_price` (numeric) - Retail price
      - `currency` (text) - Currency code (EUR, USD, etc.)
      - `image_url` (text) - Product image URL (nullable)
      - `affiliate_link` (text) - Affiliate/purchase link (nullable)
      - `is_active` (boolean) - Whether product is active
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Record update timestamp

  2. Indexes
    - Index on `style_code` for quick lookups
    - Index on `sku` for inventory management
    - Index on `category` and `sub_category` for filtering
    - Index on `is_active` for active product queries

  3. Security
    - Enable RLS on `brams_fruit_products` table
    - Public read access for active products
    - Admin-only write access (via @fitfi.ai email check)

  4. Notes
    - Products are organized by style_code with variants (size/color)
    - Image URLs to be populated via admin upload
    - Affiliate links for FitFi integration
*/

-- Create the products table
CREATE TABLE IF NOT EXISTS brams_fruit_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id text NOT NULL,
  style_code text NOT NULL,
  parent_id text NOT NULL,
  department text NOT NULL DEFAULT 'Menswear',
  category text NOT NULL,
  sub_category text NOT NULL,
  product_name text NOT NULL,
  material_composition text,
  barcode text,
  gender text NOT NULL DEFAULT 'Male',
  color_family text NOT NULL,
  color text NOT NULL,
  size text NOT NULL,
  country_of_origin text,
  sku text UNIQUE NOT NULL,
  hs_code text,
  is_pack boolean DEFAULT false,
  wholesale_price numeric(10,2) NOT NULL,
  retail_price numeric(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'EUR',
  image_url text,
  affiliate_link text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_brams_style_code ON brams_fruit_products(style_code);
CREATE INDEX IF NOT EXISTS idx_brams_sku ON brams_fruit_products(sku);
CREATE INDEX IF NOT EXISTS idx_brams_category ON brams_fruit_products(category);
CREATE INDEX IF NOT EXISTS idx_brams_sub_category ON brams_fruit_products(sub_category);
CREATE INDEX IF NOT EXISTS idx_brams_is_active ON brams_fruit_products(is_active);
CREATE INDEX IF NOT EXISTS idx_brams_parent_id ON brams_fruit_products(parent_id);

-- Enable RLS
ALTER TABLE brams_fruit_products ENABLE ROW LEVEL SECURITY;

-- Public can view active products
CREATE POLICY "Anyone can view active Brams Fruit products"
  ON brams_fruit_products
  FOR SELECT
  USING (is_active = true);

-- Authenticated users can view all products (including inactive)
CREATE POLICY "Authenticated users can view all Brams Fruit products"
  ON brams_fruit_products
  FOR SELECT
  TO authenticated
  USING (true);

-- Only admins (@fitfi.ai emails) can insert products
CREATE POLICY "Admins can insert Brams Fruit products"
  ON brams_fruit_products
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT email FROM auth.users WHERE id = auth.uid()) LIKE '%@fitfi.ai'
  );

-- Only admins can update products
CREATE POLICY "Admins can update Brams Fruit products"
  ON brams_fruit_products
  FOR UPDATE
  TO authenticated
  USING (
    (SELECT email FROM auth.users WHERE id = auth.uid()) LIKE '%@fitfi.ai'
  )
  WITH CHECK (
    (SELECT email FROM auth.users WHERE id = auth.uid()) LIKE '%@fitfi.ai'
  );

-- Only admins can delete products
CREATE POLICY "Admins can delete Brams Fruit products"
  ON brams_fruit_products
  FOR DELETE
  TO authenticated
  USING (
    (SELECT email FROM auth.users WHERE id = auth.uid()) LIKE '%@fitfi.ai'
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_brams_fruit_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_brams_fruit_products_timestamp ON brams_fruit_products;
CREATE TRIGGER update_brams_fruit_products_timestamp
  BEFORE UPDATE ON brams_fruit_products
  FOR EACH ROW
  EXECUTE FUNCTION update_brams_fruit_products_updated_at();
