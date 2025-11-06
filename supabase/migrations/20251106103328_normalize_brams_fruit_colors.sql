/*
  # Normalize Color Names for Better Matching
  
  1. Changes
    - Normalize Brams Fruit color names to standard base colors
    - Improve color harmony matching by reducing color variations
    
  2. Mapping
    - All "Washed X" and "Solid X" → base color
    - "Grey Melange" → "grey"
    - "Midnight Blue" → "navy"
    - Keep only base colors: navy, black, grey, white, beige, khaki, olive, charcoal, green, blue, brown
*/

-- Normalize navy variations
UPDATE products
SET colors = array_replace(colors, 'Washed Midnight Blue', 'navy')
WHERE brand = 'Brams Fruit' AND 'Washed Midnight Blue' = ANY(colors);

UPDATE products
SET colors = array_replace(colors, 'Solid Midnight Blue', 'navy')
WHERE brand = 'Brams Fruit' AND 'Solid Midnight Blue' = ANY(colors);

UPDATE products
SET colors = array_replace(colors, 'Navy', 'navy')
WHERE brand = 'Brams Fruit' AND 'Navy' = ANY(colors);

-- Normalize black
UPDATE products
SET colors = array_replace(colors, 'Black', 'black')
WHERE brand = 'Brams Fruit' AND 'Black' = ANY(colors);

-- Normalize grey variations
UPDATE products
SET colors = array_replace(colors, 'Grey Melange', 'grey')
WHERE brand = 'Brams Fruit' AND 'Grey Melange' = ANY(colors);

UPDATE products
SET colors = array_replace(colors, 'Washed Charcoal', 'charcoal')
WHERE brand = 'Brams Fruit' AND 'Washed Charcoal' = ANY(colors);

UPDATE products
SET colors = array_replace(colors, 'Solid Charcoal', 'charcoal')
WHERE brand = 'Brams Fruit' AND 'Solid Charcoal' = ANY(colors);

-- Normalize beige/khaki
UPDATE products
SET colors = array_replace(colors, 'Solid Beige', 'beige')
WHERE brand = 'Brams Fruit' AND 'Solid Beige' = ANY(colors);

UPDATE products
SET colors = array_replace(colors, 'Beige', 'beige')
WHERE brand = 'Brams Fruit' AND 'Beige' = ANY(colors);

UPDATE products
SET colors = array_replace(colors, 'Washed Khaki', 'khaki')
WHERE brand = 'Brams Fruit' AND 'Washed Khaki' = ANY(colors);

UPDATE products
SET colors = array_replace(colors, 'Khaki', 'khaki')
WHERE brand = 'Brams Fruit' AND 'Khaki' = ANY(colors);

-- Normalize olive
UPDATE products
SET colors = array_replace(colors, 'Washed Olive Green', 'olive')
WHERE brand = 'Brams Fruit' AND 'Washed Olive Green' = ANY(colors);

UPDATE products
SET colors = array_replace(colors, 'Solid Olive Green', 'olive')
WHERE brand = 'Brams Fruit' AND 'Solid Olive Green' = ANY(colors);

-- Normalize white
UPDATE products
SET colors = array_replace(colors, 'White', 'white')
WHERE brand = 'Brams Fruit' AND 'White' = ANY(colors);

-- Normalize green
UPDATE products
SET colors = array_replace(colors, 'Green', 'green')
WHERE brand = 'Brams Fruit' AND 'Green' = ANY(colors);

-- Normalize blue
UPDATE products
SET colors = array_replace(colors, 'Blue', 'blue')
WHERE brand = 'Brams Fruit' AND 'Blue' = ANY(colors);

-- Normalize brown
UPDATE products
SET colors = array_replace(colors, 'Brown', 'brown')
WHERE brand = 'Brams Fruit' AND 'Brown' = ANY(colors);

UPDATE products
SET colors = array_replace(colors, 'Chocolate Brown', 'brown')
WHERE brand = 'Brams Fruit' AND 'Chocolate Brown' = ANY(colors);

-- Normalize red
UPDATE products
SET colors = array_replace(colors, 'Red', 'red')
WHERE brand = 'Brams Fruit' AND 'Red' = ANY(colors);

UPDATE products
SET colors = array_replace(colors, 'Washed Red', 'red')
WHERE brand = 'Brams Fruit' AND 'Washed Red' = ANY(colors);
