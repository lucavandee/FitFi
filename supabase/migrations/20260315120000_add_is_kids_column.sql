/*
  # Add is_kids column to products table

  Adds a boolean flag to identify kids' clothing products at the database level.
  This is the ultimate safety net — even if import or client-side filters fail,
  kids' products are excluded at the query layer via WHERE is_kids = false.

  ## Changes
  1. Add `is_kids` boolean column (default false)
  2. Mark existing kids products based on multiple indicators
  3. Create partial index for fast filtering
*/

-- 1. Add the column
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_kids boolean NOT NULL DEFAULT false;

-- 2. Mark existing kids products based on name/description/type keywords
UPDATE products SET is_kids = true
WHERE is_kids = false AND (
  -- Keyword match on name (Dutch + English kids terms)
  name ~* '\m(baby|babies|peuter|kleuter|dreumes|newborn|infant|toddler|kinder|kinderen|junior|kids|kid|jongens|meisjes|boys|girls|child|children)\M'
  -- Keyword match on description
  OR description ~* '\m(baby|babies|peuter|kleuter|dreumes|newborn|infant|toddler|kinder|kinderen|junior|kids|kid|jongens|meisjes|boys|girls|child|children)\M'
  -- Keyword match on type field
  OR type ~* '\m(baby|babies|peuter|kleuter|dreumes|newborn|infant|toddler|kinder|kinderen|junior|kids|kid|jongens|meisjes|boys|girls|child|children)\M'
  -- Image URL contains kids path segments
  OR image_url ~* '/(kids|children|kinder|junior|boys|girls)/'
);

-- 3. Mark products with EU kids sizes (50-176 are kids, without adult sizes present)
-- Only flag products where ALL numeric sizes are in kids range
UPDATE products SET is_kids = true
WHERE is_kids = false
  AND array_length(sizes, 1) > 0
  AND NOT EXISTS (
    -- Exclude if any size looks like adult (S, M, L, XL, or numeric >= 32 for pants/shoes)
    SELECT 1 FROM unnest(sizes) AS s
    WHERE s ~* '^(XXS|XS|S|M|L|XL|XXL|XXXL|2XL|3XL|4XL|ONE SIZE)$'
  )
  AND (
    -- All numeric sizes are in EU kids clothing range (50-176)
    SELECT bool_and(s::int BETWEEN 50 AND 176)
    FROM unnest(sizes) AS s
    WHERE s ~ '^\d{2,3}$'
  ) = true
  -- Must have at least 1 numeric size in kids range to trigger
  AND EXISTS (
    SELECT 1 FROM unnest(sizes) AS s
    WHERE s ~ '^\d{2,3}$' AND s::int BETWEEN 50 AND 176
  );

-- 4. Create partial index for fast filtering (most queries will use WHERE is_kids = false)
CREATE INDEX IF NOT EXISTS idx_products_not_kids ON products (id) WHERE is_kids = false;

-- 5. Create index on is_kids for admin queries
CREATE INDEX IF NOT EXISTS idx_products_is_kids ON products (is_kids);
