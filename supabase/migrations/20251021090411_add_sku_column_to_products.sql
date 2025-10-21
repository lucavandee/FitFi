/*
  # Add SKU column to products table

  1. Changes
    - Add `sku` column to products table (text, unique)
    - Add index on SKU for faster lookups
  
  2. Purpose
    - Enable Brams Fruit product imports with unique SKU identifiers
    - Support upsert operations based on SKU
*/

-- Add SKU column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'sku'
  ) THEN
    ALTER TABLE products ADD COLUMN sku text;
  END IF;
END $$;

-- Create unique index on SKU
CREATE UNIQUE INDEX IF NOT EXISTS products_sku_key ON products(sku) WHERE sku IS NOT NULL;
