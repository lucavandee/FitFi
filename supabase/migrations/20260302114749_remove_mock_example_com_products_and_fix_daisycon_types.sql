/*
  # Remove mock products and fix Daisycon product types

  1. Remove all products with example.com image URLs
     These are mock/seed products that cause 503 errors and CSP violations.
     They have fake data and should not appear in recommendations.

  2. Fix Daisycon product type field
     All Daisycon-imported products have type = 'required' (from the feed's
     update_info.status field being incorrectly used). We infer the correct
     type from the category and name.
*/

-- Remove mock products with broken example.com image URLs
DELETE FROM products
WHERE image_url LIKE '%example.com%';

-- Fix Daisycon product type: map category to a sensible type value
UPDATE products
SET type = CASE
  WHEN category = 'top'        THEN 'shirt'
  WHEN category = 'bottom'     THEN 'trousers'
  WHEN category = 'outerwear'  THEN 'jacket'
  WHEN category = 'footwear'   THEN 'sneakers'
  WHEN category = 'accessory'  THEN 'accessory'
  ELSE category
END
WHERE source = 'daisycon' AND type = 'required';
