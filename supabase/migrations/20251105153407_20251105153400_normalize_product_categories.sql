/*
  # Normalize Product Categories

  1. Changes
    - Map Bram's Fruit categories to standard categories (top, bottom, footwear, accessory, outerwear)
    - Keep original category in a new 'original_category' column for reference

  2. Mapping
    - "Polo's & T-shirts", "Sweatshirts", "Knitwear", "Shirting", "Overshirts" → "top"
    - "Trousers" → "bottom"
    - "Outerwear" (capitalized) → "outerwear"
    - "Accessories" (capitalized) → "accessory"
*/

-- Add original_category column to preserve source data
ALTER TABLE products ADD COLUMN IF NOT EXISTS original_category text;

-- Update original_category with current values (before normalization)
UPDATE products
SET original_category = category
WHERE original_category IS NULL;

-- Normalize Bram's Fruit categories to standard categories
UPDATE products SET category = 'top'
WHERE category IN ('Polo''s & T-shirts', 'Sweatshirts', 'Knitwear', 'Shirting', 'Overshirts');

UPDATE products SET category = 'bottom'
WHERE category = 'Trousers';

UPDATE products SET category = 'outerwear'
WHERE category = 'Outerwear';

UPDATE products SET category = 'accessory'
WHERE category = 'Accessories';

-- Create index on normalized category for faster queries
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);