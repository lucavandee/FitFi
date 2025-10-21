/*
  # Fix SKU Unique Constraint for Upsert Operations

  1. Problem
    - Partial unique index (WHERE sku IS NOT NULL) doesn't work with PostgREST on_conflict
    - PostgREST requires a full UNIQUE constraint for upsert operations

  2. Solution
    - Drop the partial unique index
    - Add a proper UNIQUE constraint on the sku column
    - This allows `on_conflict=sku` to work correctly in upsert operations

  3. Impact
    - Enables proper product upserts based on SKU
    - Prevents duplicate SKU entries
    - Fixes 400 Bad Request errors during import
*/

-- Drop the partial unique index if it exists
DROP INDEX IF EXISTS products_sku_key;

-- Add a proper UNIQUE constraint on the sku column
-- This will create a unique index automatically
DO $$
BEGIN
  -- Check if constraint already exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'products_sku_unique' 
    AND conrelid = 'products'::regclass
  ) THEN
    ALTER TABLE products ADD CONSTRAINT products_sku_unique UNIQUE (sku);
  END IF;
END $$;
