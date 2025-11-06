/*
  # Enrich Brams Fruit Product Tags
  
  1. Changes
    - Add style-specific tags to improve matching algorithm
    - Add layering/occasion/formality tags based on product type
    
  2. Tag Categories
    - Style tags: streetwear, casual, layering, smart-casual, classic
    - Occasion tags: weekend, everyday, date-night, office
    - Feature tags: oversized, fitted, relaxed, tailored
*/

-- Hoodies & Sweatshirts → streetwear, layering, casual
UPDATE products
SET tags = array_cat(tags, ARRAY['streetwear', 'layering', 'everyday', 'relaxed'])
WHERE brand = 'Brams Fruit'
  AND original_category IN ('Sweatshirts', 'Hoodies')
  AND NOT (tags && ARRAY['streetwear', 'layering']);

-- T-shirts & Polos → casual, everyday, basic
UPDATE products
SET tags = array_cat(tags, ARRAY['casual', 'everyday', 'basic', 'essential'])
WHERE brand = 'Brams Fruit'
  AND original_category IN ('Polo''s & T-shirts')
  AND NOT (tags && ARRAY['casual', 'everyday']);

-- Trousers → tailored, smart-casual, versatile
UPDATE products
SET tags = array_cat(tags, ARRAY['tailored', 'smart-casual', 'versatile', 'office'])
WHERE brand = 'Brams Fruit'
  AND original_category = 'Trousers'
  AND NOT (tags && ARRAY['tailored', 'smart-casual']);

-- Shirts → classic, formal, layering
UPDATE products
SET tags = array_cat(tags, ARRAY['classic', 'smart', 'layering', 'date-night'])
WHERE brand = 'Brams Fruit'
  AND original_category = 'Shirting'
  AND NOT (tags && ARRAY['classic', 'smart']);

-- Overshirts → layering, casual, transitional
UPDATE products
SET tags = array_cat(tags, ARRAY['layering', 'casual', 'transitional', 'weekend'])
WHERE brand = 'Brams Fruit'
  AND original_category = 'Overshirts'
  AND NOT (tags && ARRAY['layering', 'casual']);

-- Outerwear → statement, premium, seasonal
UPDATE products
SET tags = array_cat(tags, ARRAY['statement', 'premium', 'outerwear', 'seasonal'])
WHERE brand = 'Brams Fruit'
  AND category = 'outerwear'
  AND NOT (tags && ARRAY['statement', 'premium']);

-- Accessories → finishing-touch, minimal
UPDATE products
SET tags = array_cat(tags, ARRAY['finishing-touch', 'minimal', 'accessory'])
WHERE brand = 'Brams Fruit'
  AND category = 'accessory'
  AND NOT (tags && ARRAY['finishing-touch', 'minimal']);

-- Add "oversized" tag to oversized products
UPDATE products
SET tags = array_cat(tags, ARRAY['oversized', 'relaxed-fit'])
WHERE brand = 'Brams Fruit'
  AND (
    name ILIKE '%oversized%' OR
    name ILIKE '%boxy%' OR
    name ILIKE '%relaxed%'
  )
  AND NOT (tags && ARRAY['oversized']);

-- Add "fitted" tag to fitted products
UPDATE products
SET tags = array_cat(tags, ARRAY['fitted', 'slim-fit'])
WHERE brand = 'Brams Fruit'
  AND (
    name ILIKE '%slim%' OR
    name ILIKE '%fitted%' OR
    name ILIKE '%tailored%'
  )
  AND NOT (tags && ARRAY['fitted']);
