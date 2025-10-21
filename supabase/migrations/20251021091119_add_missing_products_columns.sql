/*
  # Add Missing Columns to Products Table

  1. Changes
    - Add `gender` column (text) for filtering men/women/unisex products
    - Add `type` column (text) for product subcategory (e.g., "jeans", "shirt", "sneakers")
    - Add `affiliate_url` column (text) for affiliate tracking links
    - Add `product_url` column (text) for direct product page links

  2. Purpose
    - Enable gender-based product filtering in recommendations
    - Support detailed product type categorization
    - Track affiliate links separately from direct URLs
    - Maintain compatibility with Brams Fruit and other retailer imports

  3. Notes
    - All columns are nullable for backward compatibility
    - Existing products will have NULL values for new columns
    - Recommendation engine will work with or without these values
*/

-- Add gender column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'gender'
  ) THEN
    ALTER TABLE products ADD COLUMN gender text;
  END IF;
END $$;

-- Add type column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'type'
  ) THEN
    ALTER TABLE products ADD COLUMN type text;
  END IF;
END $$;

-- Add affiliate_url column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'affiliate_url'
  ) THEN
    ALTER TABLE products ADD COLUMN affiliate_url text;
  END IF;
END $$;

-- Add product_url column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'product_url'
  ) THEN
    ALTER TABLE products ADD COLUMN product_url text;
  END IF;
END $$;

-- Add indexes for commonly queried columns
CREATE INDEX IF NOT EXISTS products_gender_idx ON products(gender) WHERE gender IS NOT NULL;
CREATE INDEX IF NOT EXISTS products_type_idx ON products(type) WHERE type IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN products.gender IS 'Product gender category: male, female, unisex, etc.';
COMMENT ON COLUMN products.type IS 'Product subcategory/type: jeans, shirt, sneakers, etc.';
COMMENT ON COLUMN products.affiliate_url IS 'Affiliate tracking URL for commission-based links';
COMMENT ON COLUMN products.product_url IS 'Direct URL to product page on retailer site';
