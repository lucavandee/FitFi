/*
  # Fix Brams Fruit product prices and images

  1. Changes
    - Convert price column from text to numeric
    - Update image_url for Brams Fruit products based on SKU
    
  2. Data fixes
    - Parse text prices to numeric values
    - Generate placeholder image URLs for Brams Fruit products
    
  3. Notes
    - Prices are currently stored as text ("190") instead of numbers
    - Brams Fruit products have no images (all NULL)
*/

-- First, convert prices from text to numeric
DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN 
    SELECT id, price 
    FROM products 
    WHERE price IS NOT NULL AND price::text ~ '^\d+(\.\d+)?$'
  LOOP
    -- Safe conversion from text to numeric
    UPDATE products 
    SET price = rec.price::numeric
    WHERE id = rec.id;
  END LOOP;
END $$;

-- Ensure price column is numeric type (if not already)
ALTER TABLE products ALTER COLUMN price TYPE numeric USING price::numeric;

-- Add image_url for Brams Fruit products using fallback pattern
UPDATE products
SET image_url = '/images/fallbacks/top.jpg'
WHERE retailer = 'Brams Fruit' 
  AND category = 'top' 
  AND (image_url IS NULL OR image_url = '');

UPDATE products
SET image_url = '/images/fallbacks/bottom.jpg'
WHERE retailer = 'Brams Fruit' 
  AND category = 'bottom' 
  AND (image_url IS NULL OR image_url = '');

UPDATE products
SET image_url = '/images/fallbacks/footwear.jpg'
WHERE retailer = 'Brams Fruit' 
  AND category = 'footwear' 
  AND (image_url IS NULL OR image_url = '');

UPDATE products
SET image_url = '/images/fallbacks/outerwear.jpg'
WHERE retailer = 'Brams Fruit' 
  AND category = 'outerwear' 
  AND (image_url IS NULL OR image_url = '');

UPDATE products
SET image_url = '/images/fallbacks/accessory.jpg'
WHERE retailer = 'Brams Fruit' 
  AND category = 'accessory' 
  AND (image_url IS NULL OR image_url = '');

UPDATE products
SET image_url = '/images/fallbacks/default.jpg'
WHERE retailer = 'Brams Fruit' 
  AND (image_url IS NULL OR image_url = '')
  AND category NOT IN ('top', 'bottom', 'footwear', 'outerwear', 'accessory');

-- Log results
DO $$
DECLARE
  price_count INTEGER;
  image_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO price_count FROM products WHERE price IS NOT NULL;
  SELECT COUNT(*) INTO image_count FROM products WHERE image_url IS NOT NULL;
  
  RAISE NOTICE 'Fixed % products with prices', price_count;
  RAISE NOTICE 'Fixed % products with images', image_count;
END $$;