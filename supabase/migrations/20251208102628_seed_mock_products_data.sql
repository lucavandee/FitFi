/*
  # Seed Mock Products Data for Testing
  
  1. Purpose
    - Add 100 mock products for testing outfit generation
    - Diverse range of categories, brands, and styles
    - Mix of budget/mid/premium price tiers
    
  2. Products Added
    - 100 products across multiple categories:
      - Outerwear (puffers, coats, jackets, overshirts)
      - Shoes (boots, sneakers, loafers)
      - Athleisure (hoodies, joggers)
      - Accessories (bags, caps, scarves)
      - Tops (shirts, t-shirts, blouses)
      - Bottoms (trousers, jeans, skirts)
      - Dresses (slip dress, midi dress)
      - Knitwear (sweaters, cardigans)
    - Brands: Urban Nine, Studio Jordaan, Canal Studio, Soft Layer, Harbor Line, Nordic Form, Civic Tailor
    - Gender distribution: male, female, unisex
    - Price range: €24.51 - €342.48
    
  3. Data Mapping
    - SKU: mock-001 through mock-100
    - Tags include: style_tags + season + price_tier
    - Style field: vibe from CSV
    - Retailer: derived from deeplink_partner
    - Colors and sizes: converted from pipe-separated to arrays
    
  4. Notes
    - Image URLs are placeholders for testing
    - All existing Brams Fruit products are preserved
    - Affiliate URLs only set when deeplink_partner != 'none'
*/

-- Insert mock products
INSERT INTO products (
  sku,
  name,
  description,
  brand,
  gender,
  category,
  original_category,
  type,
  price,
  in_stock,
  sizes,
  colors,
  tags,
  style,
  image_url,
  product_url,
  affiliate_url,
  retailer
) VALUES
-- mock-001
('mock-001', 'Urban Nine Puffer', 'Urban Nine Puffer', 'Urban Nine', 'male', 'outerwear', 'outerwear', 'puffer', 71.59, true, ARRAY['S','XL'], ARRAY['light blue','charcoal'], ARRAY['weekend relaxed','minimalistisch','fall','mid'], 'relaxed', 'https://example.com/images/mock-001.jpg', 'https://example.com/products/mock-001', NULL, 'Other'),

-- mock-002
('mock-002', 'Urban Nine Boots', 'Urban Nine Boots', 'Urban Nine', 'unisex', 'shoes', 'shoes', 'boots', 181.21, true, ARRAY['36','37','38','44'], ARRAY['light blue','white'], ARRAY['amsterdam streetwear','party','fall','premium'], 'relaxed', 'https://example.com/images/mock-002.jpg', 'https://example.com/products/mock-002', 'https://example.com/products/mock-002', 'ASOS'),

-- mock-003
('mock-003', 'Studio Jordaan Joggers', 'Studio Jordaan Joggers', 'Studio Jordaan', 'unisex', 'athleisure', 'athleisure', 'joggers', 223.40, true, ARRAY['L','XL','XS'], ARRAY['light blue','pastel green','olive'], ARRAY['street luxe','amsterdam streetwear','summer','premium'], 'clean', 'https://example.com/images/mock-003.jpg', 'https://example.com/products/mock-003', 'https://example.com/products/mock-003', 'Zalando'),

-- mock-004
('mock-004', 'Canal Studio Bag', 'Canal Studio Bag', 'Canal Studio', 'female', 'accessory', 'accessory', 'bag', 280.14, true, ARRAY['one'], ARRAY['black','olive'], ARRAY['smart casual','office ready','fall','premium'], 'relaxed', 'https://example.com/images/mock-004.jpg', 'https://example.com/products/mock-004', NULL, 'Other'),

-- mock-005
('mock-005', 'Soft Layer Boots', 'Soft Layer Boots', 'Soft Layer', 'female', 'shoes', 'shoes', 'boots', 210.41, true, ARRAY['37'], ARRAY['light blue','cream'], ARRAY['smart casual','minimalistisch','fall','premium'], 'clean', 'https://example.com/images/mock-005.jpg', 'https://example.com/products/mock-005', 'https://example.com/products/mock-005', 'ASOS'),

-- mock-006
('mock-006', 'Studio Jordaan Puffer', 'Studio Jordaan Puffer', 'Studio Jordaan', 'female', 'outerwear', 'outerwear', 'puffer', 215.27, true, ARRAY['M','XS'], ARRAY['black','grey'], ARRAY['smart casual','italian tailored','summer','premium'], 'tailored', 'https://example.com/images/mock-006.jpg', 'https://example.com/products/mock-006', NULL, 'Other'),

-- mock-007
('mock-007', 'Urban Nine Hoodie', 'Urban Nine Hoodie', 'Urban Nine', 'unisex', 'athleisure', 'athleisure', 'hoodie', 52.37, true, ARRAY['L','XS'], ARRAY['olive','beige'], ARRAY['weekend relaxed','scandi clean','spring','mid'], 'tailored', 'https://example.com/images/mock-007.jpg', 'https://example.com/products/mock-007', 'https://example.com/products/mock-007', 'ASOS'),

-- mock-008
('mock-008', 'Urban Nine Coat', 'Urban Nine Coat', 'Urban Nine', 'female', 'outerwear', 'outerwear', 'coat', 93.78, false, ARRAY['L','XS'], ARRAY['white','cream'], ARRAY['athleisure','winter','mid'], 'clean', 'https://example.com/images/mock-008.jpg', 'https://example.com/products/mock-008', 'https://example.com/products/mock-008', 'ASOS'),

-- mock-009
('mock-009', 'Urban Nine Cap', 'Urban Nine Cap', 'Urban Nine', 'female', 'accessory', 'accessory', 'cap', 160.21, true, ARRAY['one'], ARRAY['light blue'], ARRAY['smart casual','party','fall','premium'], 'relaxed', 'https://example.com/images/mock-009.jpg', 'https://example.com/products/mock-009', 'https://example.com/products/mock-009', 'ASOS'),

-- mock-010
('mock-010', 'Urban Nine Cap', 'Urban Nine Cap', 'Urban Nine', 'male', 'accessory', 'accessory', 'cap', 77.43, true, ARRAY['one'], ARRAY['cream'], ARRAY['party','italian tailored','fall','mid'], 'clean', 'https://example.com/images/mock-010.jpg', 'https://example.com/products/mock-010', 'https://example.com/products/mock-010', 'ASOS'),

-- mock-011
('mock-011', 'Soft Layer Scarf', 'Soft Layer Scarf', 'Soft Layer', 'unisex', 'accessory', 'accessory', 'scarf', 331.03, true, ARRAY['one'], ARRAY['light blue','charcoal','beige'], ARRAY['athleisure','amsterdam streetwear','fall','premium'], 'oversized', 'https://example.com/images/mock-011.jpg', 'https://example.com/products/mock-011', 'https://example.com/products/mock-011', 'ASOS'),

-- mock-012
('mock-012', 'Urban Nine Puffer', 'Urban Nine Puffer', 'Urban Nine', 'female', 'outerwear', 'outerwear', 'puffer', 185.39, true, ARRAY['L','M','XS'], ARRAY['black','white','grey'], ARRAY['italian tailored','smart casual','winter','premium'], 'tailored', 'https://example.com/images/mock-012.jpg', 'https://example.com/products/mock-012', NULL, 'Other'),

-- mock-013
('mock-013', 'Urban Nine Cap', 'Urban Nine Cap', 'Urban Nine', 'unisex', 'accessory', 'accessory', 'cap', 264.17, true, ARRAY['one'], ARRAY['brown','cream','black'], ARRAY['amsterdam streetwear','party','fall','premium'], 'sporty', 'https://example.com/images/mock-013.jpg', 'https://example.com/products/mock-013', 'https://example.com/products/mock-013', 'ASOS'),

-- mock-014
('mock-014', 'Harbor Line Boots', 'Harbor Line Boots', 'Harbor Line', 'female', 'shoes', 'shoes', 'boots', 51.78, true, ARRAY['40','43'], ARRAY['brown','black'], ARRAY['party','weekend relaxed','fall','budget'], 'relaxed', 'https://example.com/images/mock-014.jpg', 'https://example.com/products/mock-014', NULL, 'Other'),

-- mock-015
('mock-015', 'Civic Tailor Bag', 'Civic Tailor Bag', 'Civic Tailor', 'unisex', 'accessory', 'accessory', 'bag', 221.67, true, ARRAY['one'], ARRAY['olive','brown'], ARRAY['scandi clean','minimalistisch','winter','premium'], 'relaxed', 'https://example.com/images/mock-015.jpg', 'https://example.com/products/mock-015', 'https://example.com/products/mock-015', 'ASOS'),

-- mock-016
('mock-016', 'Civic Tailor Bag', 'Civic Tailor Bag', 'Civic Tailor', 'unisex', 'accessory', 'accessory', 'bag', 139.66, true, ARRAY['one'], ARRAY['brown','olive'], ARRAY['smart casual','street luxe','winter','premium'], 'tailored', 'https://example.com/images/mock-016.jpg', 'https://example.com/products/mock-016', NULL, 'Other'),

-- mock-017
('mock-017', 'Studio Jordaan Joggers', 'Studio Jordaan Joggers', 'Studio Jordaan', 'unisex', 'athleisure', 'athleisure', 'joggers', 259.81, true, ARRAY['L','M','XS'], ARRAY['grey','light blue','charcoal'], ARRAY['party','athleisure','fall','premium'], 'relaxed', 'https://example.com/images/mock-017.jpg', 'https://example.com/products/mock-017', 'https://example.com/products/mock-017', 'ASOS'),

-- mock-018
('mock-018', 'Urban Nine Cap', 'Urban Nine Cap', 'Urban Nine', 'unisex', 'accessory', 'accessory', 'cap', 264.38, true, ARRAY['one'], ARRAY['cream','grey','charcoal'], ARRAY['smart casual','amsterdam streetwear','fall','premium'], 'relaxed', 'https://example.com/images/mock-018.jpg', 'https://example.com/products/mock-018', NULL, 'Other'),

-- mock-019
('mock-019', 'Harbor Line Puffer', 'Harbor Line Puffer', 'Harbor Line', 'female', 'outerwear', 'outerwear', 'puffer', 342.48, true, ARRAY['M','XL','XS'], ARRAY['black','grey','charcoal'], ARRAY['amsterdam streetwear','street luxe','fall','premium'], 'relaxed', 'https://example.com/images/mock-019.jpg', 'https://example.com/products/mock-019', 'https://example.com/products/mock-019', 'Zalando'),

-- mock-020
('mock-020', 'Nordic Form Hoodie', 'Nordic Form Hoodie', 'Nordic Form', 'unisex', 'athleisure', 'athleisure', 'hoodie', 156.29, true, ARRAY['XS'], ARRAY['cream','olive'], ARRAY['amsterdam streetwear','athleisure','summer','premium'], 'oversized', 'https://example.com/images/mock-020.jpg', 'https://example.com/products/mock-020', 'https://example.com/products/mock-020', 'ASOS'),

-- mock-021
('mock-021', 'Soft Layer Blouse', 'Soft Layer Blouse', 'Soft Layer', 'female', 'top', 'top', 'blouse', 76.01, true, ARRAY['L','M','S','XL'], ARRAY['olive','brown','beige'], ARRAY['office ready','weekend relaxed','fall','mid'], 'tailored', 'https://example.com/images/mock-021.jpg', 'https://example.com/products/mock-021', NULL, 'Other'),

-- mock-022
('mock-022', 'Urban Nine Boots', 'Urban Nine Boots', 'Urban Nine', 'male', 'shoes', 'shoes', 'boots', 146.77, true, ARRAY['37','39','40','42'], ARRAY['light blue','olive','brown'], ARRAY['amsterdam streetwear','street luxe','fall','premium'], 'clean', 'https://example.com/images/mock-022.jpg', 'https://example.com/products/mock-022', 'https://example.com/products/mock-022', 'ASOS'),

-- mock-023
('mock-023', 'Nordic Form Boots', 'Nordic Form Boots', 'Nordic Form', 'female', 'shoes', 'shoes', 'boots', 223.80, true, ARRAY['36','38'], ARRAY['black','light blue','olive'], ARRAY['party','street luxe','fall','premium'], 'sporty', 'https://example.com/images/mock-023.jpg', 'https://example.com/products/mock-023', 'https://example.com/products/mock-023', 'Zalando'),

-- mock-024
('mock-024', 'Urban Nine Joggers', 'Urban Nine Joggers', 'Urban Nine', 'male', 'athleisure', 'athleisure', 'joggers', 61.68, true, ARRAY['M','S','XL','XS'], ARRAY['light blue','brown','cream'], ARRAY['athleisure','minimalistisch','summer','mid'], 'oversized', 'https://example.com/images/mock-024.jpg', 'https://example.com/products/mock-024', 'https://example.com/products/mock-024', 'Zalando'),

-- mock-025
('mock-025', 'Harbor Line Boots', 'Harbor Line Boots', 'Harbor Line', 'unisex', 'shoes', 'shoes', 'boots', 24.78, true, ARRAY['40','41'], ARRAY['black','olive'], ARRAY['street luxe','amsterdam streetwear','winter','budget'], 'relaxed', 'https://example.com/images/mock-025.jpg', 'https://example.com/products/mock-025', 'https://example.com/products/mock-025', 'ASOS'),

-- mock-026
('mock-026', 'Urban Nine Scarf', 'Urban Nine Scarf', 'Urban Nine', 'unisex', 'accessory', 'accessory', 'scarf', 268.71, true, ARRAY['one'], ARRAY['black','olive'], ARRAY['street luxe','amsterdam streetwear','summer','premium'], 'clean', 'https://example.com/images/mock-026.jpg', 'https://example.com/products/mock-026', 'https://example.com/products/mock-026', 'ASOS'),

-- mock-027
('mock-027', 'Urban Nine Boots', 'Urban Nine Boots', 'Urban Nine', 'female', 'shoes', 'shoes', 'boots', 331.76, true, ARRAY['37','40','42','44'], ARRAY['olive','light blue','black'], ARRAY['street luxe','party','winter','premium'], 'sporty', 'https://example.com/images/mock-027.jpg', 'https://example.com/products/mock-027', 'https://example.com/products/mock-027', 'Zalando'),

-- mock-028
('mock-028', 'Harbor Line Cap', 'Harbor Line Cap', 'Harbor Line', 'female', 'accessory', 'accessory', 'cap', 212.99, true, ARRAY['one'], ARRAY['olive','beige'], ARRAY['scandi clean','minimalistisch','summer','premium'], 'clean', 'https://example.com/images/mock-028.jpg', 'https://example.com/products/mock-028', 'https://example.com/products/mock-028', 'ASOS'),

-- mock-029
('mock-029', 'Urban Nine Bag', 'Urban Nine Bag', 'Urban Nine', 'unisex', 'accessory', 'accessory', 'bag', 88.49, true, ARRAY['one'], ARRAY['black','olive','brown'], ARRAY['amsterdam streetwear','street luxe','fall','mid'], 'clean', 'https://example.com/images/mock-029.jpg', 'https://example.com/products/mock-029', 'https://example.com/products/mock-029', 'ASOS'),

-- mock-030
('mock-030', 'Harbor Line Scarf', 'Harbor Line Scarf', 'Harbor Line', 'unisex', 'accessory', 'accessory', 'scarf', 24.51, true, ARRAY['one'], ARRAY['olive','black','light blue'], ARRAY['weekend relaxed','smart casual','spring','budget'], 'relaxed', 'https://example.com/images/mock-030.jpg', 'https://example.com/products/mock-030', NULL, 'Other'),

-- mock-031
('mock-031', 'Urban Nine Puffer', 'Urban Nine Puffer', 'Urban Nine', 'unisex', 'outerwear', 'outerwear', 'puffer', 337.99, true, ARRAY['M','XL','XS'], ARRAY['cream','grey','olive'], ARRAY['amsterdam streetwear','street luxe','fall','premium'], 'clean', 'https://example.com/images/mock-031.jpg', 'https://example.com/products/mock-031', 'https://example.com/products/mock-031', 'ASOS'),

-- mock-032
('mock-032', 'Nordic Form Jacket', 'Nordic Form Jacket', 'Nordic Form', 'male', 'outerwear', 'outerwear', 'coat', 67.49, true, ARRAY['M','XL','XS'], ARRAY['olive','black'], ARRAY['athleisure','weekend relaxed','spring','mid'], 'relaxed', 'https://example.com/images/mock-032.jpg', 'https://example.com/products/mock-032', 'https://example.com/products/mock-032', 'ASOS'),

-- mock-033
('mock-033', 'Urban Nine Dress', 'Urban Nine Dress', 'Urban Nine', 'female', 'dress', 'dress', 'slip dress', 29.79, true, ARRAY['L','M','S'], ARRAY['black','white','cream'], ARRAY['party','street luxe','summer','budget'], 'clean', 'https://example.com/images/mock-033.jpg', 'https://example.com/products/mock-033', NULL, 'Other'),

-- mock-034
('mock-034', 'Civic Tailor Shirt', 'Civic Tailor Shirt', 'Civic Tailor', 'male', 'top', 'top', 'shirt', 105.39, true, ARRAY['L','M','XL','XS'], ARRAY['olive','charcoal','light blue'], ARRAY['office ready','smart casual','fall','mid'], 'tailored', 'https://example.com/images/mock-034.jpg', 'https://example.com/products/mock-034', 'https://example.com/products/mock-034', 'ASOS'),

-- mock-035
('mock-035', 'Urban Nine Trousers', 'Urban Nine Trousers', 'Urban Nine', 'unisex', 'bottom', 'bottom', 'trousers', 153.75, true, ARRAY['L','M','S'], ARRAY['black','olive','grey'], ARRAY['office ready','minimalistisch','spring','premium'], 'tailored', 'https://example.com/images/mock-035.jpg', 'https://example.com/products/mock-035', 'https://example.com/products/mock-035', 'ASOS'),

-- mock-036
('mock-036', 'Canal Studio T-Shirt', 'Canal Studio T-Shirt', 'Canal Studio', 'male', 'top', 'top', 't-shirt', 40.11, true, ARRAY['L','M','S','XL'], ARRAY['white','cream','grey'], ARRAY['weekend relaxed','amsterdam streetwear','summer','budget'], 'relaxed', 'https://example.com/images/mock-036.jpg', 'https://example.com/products/mock-036', NULL, 'Other'),

-- mock-037
('mock-037', 'Soft Layer Sweater', 'Soft Layer Sweater', 'Soft Layer', 'female', 'knitwear', 'knitwear', 'sweater', 80.71, true, ARRAY['L','M','S','XS'], ARRAY['cream','light blue','olive'], ARRAY['scandi clean','minimalistisch','fall','mid'], 'clean', 'https://example.com/images/mock-037.jpg', 'https://example.com/products/mock-037', 'https://example.com/products/mock-037', 'ASOS'),

-- mock-038
('mock-038', 'Studio Jordaan Cardigan', 'Studio Jordaan Cardigan', 'Studio Jordaan', 'female', 'knitwear', 'knitwear', 'cardigan', 58.32, true, ARRAY['M','S','XS'], ARRAY['beige','brown','cream'], ARRAY['weekend relaxed','smart casual','winter','mid'], 'relaxed', 'https://example.com/images/mock-038.jpg', 'https://example.com/products/mock-038', 'https://example.com/products/mock-038', 'Zalando'),

-- mock-039
('mock-039', 'Urban Nine Jeans', 'Urban Nine Jeans', 'Urban Nine', 'unisex', 'bottom', 'bottom', 'jeans', 47.43, true, ARRAY['M','S','XL'], ARRAY['blue','charcoal','black'], ARRAY['amsterdam streetwear','weekend relaxed','fall','budget'], 'relaxed', 'https://example.com/images/mock-039.jpg', 'https://example.com/products/mock-039', 'https://example.com/products/mock-039', 'ASOS'),

-- mock-040
('mock-040', 'Nordic Form Midi Dress', 'Nordic Form Midi Dress', 'Nordic Form', 'female', 'dress', 'dress', 'midi dress', 132.79, true, ARRAY['M','S','XS'], ARRAY['cream','olive'], ARRAY['smart casual','office ready','spring','premium'], 'tailored', 'https://example.com/images/mock-040.jpg', 'https://example.com/products/mock-040', NULL, 'Other'),

-- mock-041
('mock-041', 'Canal Studio Trousers', 'Canal Studio Trousers', 'Canal Studio', 'male', 'bottom', 'bottom', 'trousers', 90.66, true, ARRAY['M','S','XL'], ARRAY['olive','brown','grey'], ARRAY['office ready','minimalistisch','spring','mid'], 'tailored', 'https://example.com/images/mock-041.jpg', 'https://example.com/products/mock-041', 'https://example.com/products/mock-041', 'ASOS'),

-- mock-042
('mock-042', 'Urban Nine Hoodie', 'Urban Nine Hoodie', 'Urban Nine', 'unisex', 'athleisure', 'athleisure', 'hoodie', 69.12, true, ARRAY['L','M','S'], ARRAY['beige','olive','black'], ARRAY['athleisure','amsterdam streetwear','fall','mid'], 'oversized', 'https://example.com/images/mock-042.jpg', 'https://example.com/products/mock-042', 'https://example.com/products/mock-042', 'Zalando'),

-- mock-043
('mock-043', 'Harbor Line Shirt', 'Harbor Line Shirt', 'Harbor Line', 'male', 'top', 'top', 'shirt', 118.54, true, ARRAY['M','S','XL'], ARRAY['white','light blue','cream'], ARRAY['smart casual','office ready','spring','mid'], 'tailored', 'https://example.com/images/mock-043.jpg', 'https://example.com/products/mock-043', NULL, 'Other'),

-- mock-044
('mock-044', 'Soft Layer Skirt', 'Soft Layer Skirt', 'Soft Layer', 'female', 'bottom', 'bottom', 'skirt', 54.97, true, ARRAY['M','S','XS'], ARRAY['black','cream'], ARRAY['party','smart casual','summer','mid'], 'clean', 'https://example.com/images/mock-044.jpg', 'https://example.com/products/mock-044', 'https://example.com/products/mock-044', 'ASOS'),

-- mock-045
('mock-045', 'Urban Nine Sneakers', 'Urban Nine Sneakers', 'Urban Nine', 'unisex', 'shoes', 'shoes', 'sneakers', 65.88, true, ARRAY['38','40','42'], ARRAY['white','cream','grey'], ARRAY['amsterdam streetwear','weekend relaxed','summer','mid'], 'sporty', 'https://example.com/images/mock-045.jpg', 'https://example.com/products/mock-045', 'https://example.com/products/mock-045', 'ASOS'),

-- mock-046
('mock-046', 'Studio Jordaan Overshirt', 'Studio Jordaan Overshirt', 'Studio Jordaan', 'male', 'outerwear', 'outerwear', 'overshirt', 97.34, true, ARRAY['M','L','XL'], ARRAY['olive','brown','beige'], ARRAY['smart casual','scandi clean','fall','mid'], 'clean', 'https://example.com/images/mock-046.jpg', 'https://example.com/products/mock-046', NULL, 'Other'),

-- mock-047
('mock-047', 'Nordic Form Sweater', 'Nordic Form Sweater', 'Nordic Form', 'unisex', 'knitwear', 'knitwear', 'sweater', 72.56, true, ARRAY['L','M','S','XS'], ARRAY['grey','cream'], ARRAY['minimalistisch','winter','mid'], 'clean', 'https://example.com/images/mock-047.jpg', 'https://example.com/products/mock-047', 'https://example.com/products/mock-047', 'Zalando'),

-- mock-048
('mock-048', 'Urban Nine Slip Dress', 'Urban Nine Slip Dress', 'Urban Nine', 'female', 'dress', 'dress', 'slip dress', 44.92, true, ARRAY['M','S','XS'], ARRAY['black','olive'], ARRAY['party','street luxe','summer','budget'], 'clean', 'https://example.com/images/mock-048.jpg', 'https://example.com/products/mock-048', 'https://example.com/products/mock-048', 'ASOS'),

-- mock-049
('mock-049', 'Civic Tailor T-Shirt', 'Civic Tailor T-Shirt', 'Civic Tailor', 'unisex', 'top', 'top', 't-shirt', 35.74, true, ARRAY['L','M','S','XL'], ARRAY['white','cream'], ARRAY['weekend relaxed','minimalistisch','spring','budget'], 'relaxed', 'https://example.com/images/mock-049.jpg', 'https://example.com/products/mock-049', NULL, 'Other'),

-- mock-050
('mock-050', 'Harbor Line Jeans', 'Harbor Line Jeans', 'Harbor Line', 'male', 'bottom', 'bottom', 'jeans', 59.13, true, ARRAY['M','L','XL'], ARRAY['blue','charcoal'], ARRAY['amsterdam streetwear','weekend relaxed','fall','mid'], 'relaxed', 'https://example.com/images/mock-050.jpg', 'https://example.com/products/mock-050', 'https://example.com/products/mock-050', 'ASOS'),

-- mock-051
('mock-051', 'Urban Nine Cardigan', 'Urban Nine Cardigan', 'Urban Nine', 'female', 'knitwear', 'knitwear', 'cardigan', 84.66, true, ARRAY['M','S','XS'], ARRAY['cream','beige','light blue'], ARRAY['scandi clean','smart casual','fall','mid'], 'relaxed', 'https://example.com/images/mock-051.jpg', 'https://example.com/products/mock-051', NULL, 'Other'),

-- mock-052
('mock-052', 'Soft Layer Hoodie', 'Soft Layer Hoodie', 'Soft Layer', 'unisex', 'athleisure', 'athleisure', 'hoodie', 49.92, true, ARRAY['L','M','S'], ARRAY['grey','black'], ARRAY['athleisure','street luxe','fall','budget'], 'oversized', 'https://example.com/images/mock-052.jpg', 'https://example.com/products/mock-052', 'https://example.com/products/mock-052', 'ASOS'),

-- mock-053
('mock-053', 'Canal Studio Blouse', 'Canal Studio Blouse', 'Canal Studio', 'female', 'top', 'top', 'blouse', 62.77, true, ARRAY['M','S','XS'], ARRAY['white','cream','olive'], ARRAY['office ready','smart casual','spring','mid'], 'tailored', 'https://example.com/images/mock-053.jpg', 'https://example.com/products/mock-053', 'https://example.com/products/mock-053', 'Zalando'),

-- mock-054
('mock-054', 'Urban Nine Skirt', 'Urban Nine Skirt', 'Urban Nine', 'female', 'bottom', 'bottom', 'skirt', 41.38, true, ARRAY['M','S','XS'], ARRAY['black','grey'], ARRAY['party','street luxe','summer','budget'], 'clean', 'https://example.com/images/mock-054.jpg', 'https://example.com/products/mock-054', 'https://example.com/products/mock-054', 'ASOS'),

-- mock-055
('mock-055', 'Nordic Form Loafers', 'Nordic Form Loafers', 'Nordic Form', 'unisex', 'shoes', 'shoes', 'loafers', 132.46, true, ARRAY['39','40','42'], ARRAY['black','brown'], ARRAY['smart casual','office ready','spring','premium'], 'clean', 'https://example.com/images/mock-055.jpg', 'https://example.com/products/mock-055', NULL, 'Other'),

-- mock-056
('mock-056', 'Studio Jordaan Shirt', 'Studio Jordaan Shirt', 'Studio Jordaan', 'male', 'top', 'top', 'shirt', 88.14, true, ARRAY['L','M','XL'], ARRAY['light blue','white'], ARRAY['smart casual','scandi clean','spring','mid'], 'tailored', 'https://example.com/images/mock-056.jpg', 'https://example.com/products/mock-056', 'https://example.com/products/mock-056', 'ASOS'),

-- mock-057
('mock-057', 'Urban Nine Bag', 'Urban Nine Bag', 'Urban Nine', 'unisex', 'accessory', 'accessory', 'bag', 119.44, true, ARRAY['one'], ARRAY['black','beige'], ARRAY['street luxe','amsterdam streetwear','winter','mid'], 'clean', 'https://example.com/images/mock-057.jpg', 'https://example.com/products/mock-057', 'https://example.com/products/mock-057', 'Zalando'),

-- mock-058
('mock-058', 'Harbor Line Sneakers', 'Harbor Line Sneakers', 'Harbor Line', 'unisex', 'shoes', 'shoes', 'sneakers', 72.03, true, ARRAY['38','40','41','43'], ARRAY['white','grey','olive'], ARRAY['amsterdam streetwear','weekend relaxed','summer','mid'], 'sporty', 'https://example.com/images/mock-058.jpg', 'https://example.com/products/mock-058', 'https://example.com/products/mock-058', 'ASOS'),

-- mock-059
('mock-059', 'Soft Layer Midi Dress', 'Soft Layer Midi Dress', 'Soft Layer', 'female', 'dress', 'dress', 'midi dress', 93.52, true, ARRAY['M','S','XS'], ARRAY['cream','light blue'], ARRAY['smart casual','weekend relaxed','spring','mid'], 'relaxed', 'https://example.com/images/mock-059.jpg', 'https://example.com/products/mock-059', NULL, 'Other'),

-- mock-060
('mock-060', 'Urban Nine Overshirt', 'Urban Nine Overshirt', 'Urban Nine', 'unisex', 'outerwear', 'outerwear', 'overshirt', 110.37, true, ARRAY['M','L','XL'], ARRAY['olive','brown'], ARRAY['minimalistisch','fall','mid'], 'clean', 'https://example.com/images/mock-060.jpg', 'https://example.com/products/mock-060', 'https://example.com/products/mock-060', 'ASOS'),

-- mock-061
('mock-061', 'Civic Tailor Trousers', 'Civic Tailor Trousers', 'Civic Tailor', 'male', 'bottom', 'bottom', 'trousers', 129.55, true, ARRAY['M','L','XL'], ARRAY['grey','charcoal','black'], ARRAY['office ready','smart casual','fall','mid'], 'tailored', 'https://example.com/images/mock-061.jpg', 'https://example.com/products/mock-061', 'https://example.com/products/mock-061', 'Zalando'),

-- mock-062
('mock-062', 'Urban Nine Sweater', 'Urban Nine Sweater', 'Urban Nine', 'unisex', 'knitwear', 'knitwear', 'sweater', 69.74, true, ARRAY['L','M','S'], ARRAY['cream','olive','grey'], ARRAY['weekend relaxed','minimalistisch','winter','mid'], 'relaxed', 'https://example.com/images/mock-062.jpg', 'https://example.com/products/mock-062', 'https://example.com/products/mock-062', 'ASOS'),

-- mock-063
('mock-063', 'Nordic Form Shirt', 'Nordic Form Shirt', 'Nordic Form', 'male', 'top', 'top', 'shirt', 101.26, true, ARRAY['M','L','XL'], ARRAY['white','light blue'], ARRAY['smart casual','office ready','spring','mid'], 'tailored', 'https://example.com/images/mock-063.jpg', 'https://example.com/products/mock-063', NULL, 'Other'),

-- mock-064
('mock-064', 'Studio Jordaan Jeans', 'Studio Jordaan Jeans', 'Studio Jordaan', 'unisex', 'bottom', 'bottom', 'jeans', 52.61, true, ARRAY['M','S','XL'], ARRAY['blue','black'], ARRAY['amsterdam streetwear','weekend relaxed','fall','mid'], 'relaxed', 'https://example.com/images/mock-064.jpg', 'https://example.com/products/mock-064', 'https://example.com/products/mock-064', 'ASOS'),

-- mock-065
('mock-065', 'Urban Nine Hoodie', 'Urban Nine Hoodie', 'Urban Nine', 'unisex', 'athleisure', 'athleisure', 'hoodie', 39.85, true, ARRAY['M','L','XL'], ARRAY['grey','black'], ARRAY['athleisure','amsterdam streetwear','fall','budget'], 'oversized', 'https://example.com/images/mock-065.jpg', 'https://example.com/products/mock-065', 'https://example.com/products/mock-065', 'Zalando'),

-- mock-066
('mock-066', 'Harbor Line Skirt', 'Harbor Line Skirt', 'Harbor Line', 'female', 'bottom', 'bottom', 'skirt', 57.92, true, ARRAY['S','XS'], ARRAY['black','cream'], ARRAY['party','smart casual','summer','mid'], 'clean', 'https://example.com/images/mock-066.jpg', 'https://example.com/products/mock-066', 'https://example.com/products/mock-066', 'ASOS'),

-- mock-067
('mock-067', 'Soft Layer Cardigan', 'Soft Layer Cardigan', 'Soft Layer', 'female', 'knitwear', 'knitwear', 'cardigan', 73.41, true, ARRAY['M','S','XS'], ARRAY['cream','beige','light blue'], ARRAY['scandi clean','weekend relaxed','fall','mid'], 'relaxed', 'https://example.com/images/mock-067.jpg', 'https://example.com/products/mock-067', NULL, 'Other'),

-- mock-068
('mock-068', 'Urban Nine Sneakers', 'Urban Nine Sneakers', 'Urban Nine', 'unisex', 'shoes', 'shoes', 'sneakers', 61.25, true, ARRAY['38','39','41'], ARRAY['white','grey','olive'], ARRAY['amsterdam streetwear','street luxe','summer','mid'], 'sporty', 'https://example.com/images/mock-068.jpg', 'https://example.com/products/mock-068', 'https://example.com/products/mock-068', 'ASOS'),

-- mock-069
('mock-069', 'Nordic Form Bag', 'Nordic Form Bag', 'Nordic Form', 'unisex', 'accessory', 'accessory', 'bag', 140.88, true, ARRAY['one'], ARRAY['black','olive'], ARRAY['smart casual','minimalistisch','winter','premium'], 'clean', 'https://example.com/images/mock-069.jpg', 'https://example.com/products/mock-069', 'https://example.com/products/mock-069', 'Zalando'),

-- mock-070
('mock-070', 'Studio Jordaan T-Shirt', 'Studio Jordaan T-Shirt', 'Studio Jordaan', 'unisex', 'top', 'top', 't-shirt', 33.19, true, ARRAY['L','M','S','XL'], ARRAY['white','cream','grey'], ARRAY['weekend relaxed','amsterdam streetwear','spring','budget'], 'relaxed', 'https://example.com/images/mock-070.jpg', 'https://example.com/products/mock-070', 'https://example.com/products/mock-070', 'ASOS'),

-- mock-071
('mock-071', 'Urban Nine Midi Dress', 'Urban Nine Midi Dress', 'Urban Nine', 'female', 'dress', 'dress', 'midi dress', 120.47, true, ARRAY['M','S','XS'], ARRAY['cream','olive'], ARRAY['smart casual','office ready','spring','mid'], 'tailored', 'https://example.com/images/mock-071.jpg', 'https://example.com/products/mock-071', NULL, 'Other'),

-- mock-072
('mock-072', 'Civic Tailor Jeans', 'Civic Tailor Jeans', 'Civic Tailor', 'male', 'bottom', 'bottom', 'jeans', 64.90, true, ARRAY['M','L','XL'], ARRAY['blue','charcoal'], ARRAY['smart casual','weekend relaxed','fall','mid'], 'relaxed', 'https://example.com/images/mock-072.jpg', 'https://example.com/products/mock-072', 'https://example.com/products/mock-072', 'ASOS'),

-- mock-073
('mock-073', 'Urban Nine Scarf', 'Urban Nine Scarf', 'Urban Nine', 'unisex', 'accessory', 'accessory', 'scarf', 27.56, true, ARRAY['one'], ARRAY['black','cream'], ARRAY['weekend relaxed','smart casual','winter','budget'], 'relaxed', 'https://example.com/images/mock-073.jpg', 'https://example.com/products/mock-073', 'https://example.com/products/mock-073', 'Zalando'),

-- mock-074
('mock-074', 'Harbor Line Overshirt', 'Harbor Line Overshirt', 'Harbor Line', 'male', 'outerwear', 'outerwear', 'overshirt', 112.03, true, ARRAY['M','L','XL'], ARRAY['olive','brown'], ARRAY['minimalistisch','fall','mid'], 'clean', 'https://example.com/images/mock-074.jpg', 'https://example.com/products/mock-074', 'https://example.com/products/mock-074', 'ASOS'),

-- mock-075
('mock-075', 'Soft Layer Loafers', 'Soft Layer Loafers', 'Soft Layer', 'unisex', 'shoes', 'shoes', 'loafers', 137.29, true, ARRAY['39','40','42'], ARRAY['brown','black'], ARRAY['smart casual','office ready','spring','premium'], 'clean', 'https://example.com/images/mock-075.jpg', 'https://example.com/products/mock-075', NULL, 'Other'),

-- mock-076
('mock-076', 'Urban Nine Sweater', 'Urban Nine Sweater', 'Urban Nine', 'unisex', 'knitwear', 'knitwear', 'sweater', 70.42, true, ARRAY['L','M','S','XS'], ARRAY['grey','cream'], ARRAY['minimalistisch','winter','mid'], 'clean', 'https://example.com/images/mock-076.jpg', 'https://example.com/products/mock-076', 'https://example.com/products/mock-076', 'ASOS'),

-- mock-077
('mock-077', 'Nordic Form Slip Dress', 'Nordic Form Slip Dress', 'Nordic Form', 'female', 'dress', 'dress', 'slip dress', 48.26, true, ARRAY['M','S','XS'], ARRAY['black','olive'], ARRAY['party','street luxe','summer','budget'], 'clean', 'https://example.com/images/mock-077.jpg', 'https://example.com/products/mock-077', 'https://example.com/products/mock-077', 'Zalando'),

-- mock-078
('mock-078', 'Studio Jordaan Hoodie', 'Studio Jordaan Hoodie', 'Studio Jordaan', 'unisex', 'athleisure', 'athleisure', 'hoodie', 52.83, true, ARRAY['M','L','XL'], ARRAY['grey','black'], ARRAY['athleisure','amsterdam streetwear','fall','mid'], 'oversized', 'https://example.com/images/mock-078.jpg', 'https://example.com/products/mock-078', 'https://example.com/products/mock-078', 'ASOS'),

-- mock-079
('mock-079', 'Urban Nine Blouse', 'Urban Nine Blouse', 'Urban Nine', 'female', 'top', 'top', 'blouse', 67.91, true, ARRAY['M','S','XS'], ARRAY['white','cream','olive'], ARRAY['office ready','smart casual','spring','mid'], 'tailored', 'https://example.com/images/mock-079.jpg', 'https://example.com/products/mock-079', NULL, 'Other'),

-- mock-080
('mock-080', 'Civic Tailor Skirt', 'Civic Tailor Skirt', 'Civic Tailor', 'female', 'bottom', 'bottom', 'skirt', 58.74, true, ARRAY['S','XS'], ARRAY['black','cream'], ARRAY['party','smart casual','summer','mid'], 'clean', 'https://example.com/images/mock-080.jpg', 'https://example.com/products/mock-080', 'https://example.com/products/mock-080', 'ASOS'),

-- mock-081
('mock-081', 'Urban Nine Sneakers', 'Urban Nine Sneakers', 'Urban Nine', 'unisex', 'shoes', 'shoes', 'sneakers', 69.31, true, ARRAY['38','39','40'], ARRAY['white','grey','olive'], ARRAY['amsterdam streetwear','weekend relaxed','summer','mid'], 'sporty', 'https://example.com/images/mock-081.jpg', 'https://example.com/products/mock-081', 'https://example.com/products/mock-081', 'Zalando'),

-- mock-082
('mock-082', 'Harbor Line Bag', 'Harbor Line Bag', 'Harbor Line', 'unisex', 'accessory', 'accessory', 'bag', 134.29, true, ARRAY['one'], ARRAY['black','olive'], ARRAY['smart casual','minimalistisch','winter','premium'], 'clean', 'https://example.com/images/mock-082.jpg', 'https://example.com/products/mock-082', 'https://example.com/products/mock-082', 'ASOS'),

-- mock-083
('mock-083', 'Soft Layer T-Shirt', 'Soft Layer T-Shirt', 'Soft Layer', 'unisex', 'top', 'top', 't-shirt', 32.48, true, ARRAY['L','M','S','XL'], ARRAY['white','cream','grey'], ARRAY['weekend relaxed','amsterdam streetwear','spring','budget'], 'relaxed', 'https://example.com/images/mock-083.jpg', 'https://example.com/products/mock-083', NULL, 'Other'),

-- mock-084
('mock-084', 'Urban Nine Midi Dress', 'Urban Nine Midi Dress', 'Urban Nine', 'female', 'dress', 'dress', 'midi dress', 118.95, true, ARRAY['M','S','XS'], ARRAY['cream','olive'], ARRAY['smart casual','office ready','spring','mid'], 'tailored', 'https://example.com/images/mock-084.jpg', 'https://example.com/products/mock-084', 'https://example.com/products/mock-084', 'ASOS'),

-- mock-085
('mock-085', 'Nordic Form Jeans', 'Nordic Form Jeans', 'Nordic Form', 'unisex', 'bottom', 'bottom', 'jeans', 55.91, true, ARRAY['M','S','XL'], ARRAY['blue','charcoal'], ARRAY['amsterdam streetwear','weekend relaxed','fall','mid'], 'relaxed', 'https://example.com/images/mock-085.jpg', 'https://example.com/products/mock-085', 'https://example.com/products/mock-085', 'Zalando'),

-- mock-086
('mock-086', 'Studio Jordaan Scarf', 'Studio Jordaan Scarf', 'Studio Jordaan', 'unisex', 'accessory', 'accessory', 'scarf', 26.87, true, ARRAY['one'], ARRAY['black','cream'], ARRAY['weekend relaxed','smart casual','winter','budget'], 'relaxed', 'https://example.com/images/mock-086.jpg', 'https://example.com/products/mock-086', 'https://example.com/products/mock-086', 'ASOS'),

-- mock-087
('mock-087', 'Urban Nine Overshirt', 'Urban Nine Overshirt', 'Urban Nine', 'unisex', 'outerwear', 'outerwear', 'overshirt', 108.63, true, ARRAY['M','L','XL'], ARRAY['olive','brown'], ARRAY['minimalistisch','fall','mid'], 'clean', 'https://example.com/images/mock-087.jpg', 'https://example.com/products/mock-087', NULL, 'Other'),

-- mock-088
('mock-088', 'Harbor Line Loafers', 'Harbor Line Loafers', 'Harbor Line', 'unisex', 'shoes', 'shoes', 'loafers', 128.44, true, ARRAY['39','40','42'], ARRAY['brown','black'], ARRAY['smart casual','office ready','spring','premium'], 'clean', 'https://example.com/images/mock-088.jpg', 'https://example.com/products/mock-088', 'https://example.com/products/mock-088', 'ASOS'),

-- mock-089
('mock-089', 'Soft Layer Sweater', 'Soft Layer Sweater', 'Soft Layer', 'unisex', 'knitwear', 'knitwear', 'sweater', 71.63, true, ARRAY['L','M','S','XS'], ARRAY['grey','cream'], ARRAY['minimalistisch','winter','mid'], 'clean', 'https://example.com/images/mock-089.jpg', 'https://example.com/products/mock-089', 'https://example.com/products/mock-089', 'Zalando'),

-- mock-090
('mock-090', 'Urban Nine Slip Dress', 'Urban Nine Slip Dress', 'Urban Nine', 'female', 'dress', 'dress', 'slip dress', 46.87, true, ARRAY['M','S','XS'], ARRAY['black','olive'], ARRAY['party','street luxe','summer','budget'], 'clean', 'https://example.com/images/mock-090.jpg', 'https://example.com/products/mock-090', 'https://example.com/products/mock-090', 'ASOS'),

-- mock-091
('mock-091', 'Civic Tailor Hoodie', 'Civic Tailor Hoodie', 'Civic Tailor', 'unisex', 'athleisure', 'athleisure', 'hoodie', 51.29, true, ARRAY['M','L','XL'], ARRAY['grey','black'], ARRAY['athleisure','amsterdam streetwear','fall','budget'], 'oversized', 'https://example.com/images/mock-091.jpg', 'https://example.com/products/mock-091', NULL, 'Other'),

-- mock-092
('mock-092', 'Urban Nine Trousers', 'Urban Nine Trousers', 'Urban Nine', 'unisex', 'bottom', 'bottom', 'trousers', 126.45, true, ARRAY['M','L','XL'], ARRAY['grey','charcoal','black'], ARRAY['office ready','smart casual','fall','mid'], 'tailored', 'https://example.com/images/mock-092.jpg', 'https://example.com/products/mock-092', 'https://example.com/products/mock-092', 'ASOS'),

-- mock-093
('mock-093', 'Nordic Form Blouse', 'Nordic Form Blouse', 'Nordic Form', 'female', 'top', 'top', 'blouse', 63.22, true, ARRAY['M','S','XS'], ARRAY['white','cream','olive'], ARRAY['office ready','smart casual','spring','mid'], 'tailored', 'https://example.com/images/mock-093.jpg', 'https://example.com/products/mock-093', 'https://example.com/products/mock-093', 'Zalando'),

-- mock-094
('mock-094', 'Studio Jordaan Skirt', 'Studio Jordaan Skirt', 'Studio Jordaan', 'female', 'bottom', 'bottom', 'skirt', 56.88, true, ARRAY['S','XS'], ARRAY['black','cream'], ARRAY['party','smart casual','summer','mid'], 'clean', 'https://example.com/images/mock-094.jpg', 'https://example.com/products/mock-094', 'https://example.com/products/mock-094', 'ASOS'),

-- mock-095
('mock-095', 'Urban Nine Sneakers', 'Urban Nine Sneakers', 'Urban Nine', 'unisex', 'shoes', 'shoes', 'sneakers', 68.42, true, ARRAY['38','39','40'], ARRAY['white','grey','olive'], ARRAY['amsterdam streetwear','weekend relaxed','summer','mid'], 'sporty', 'https://example.com/images/mock-095.jpg', 'https://example.com/products/mock-095', NULL, 'Other'),

-- mock-096
('mock-096', 'Harbor Line Bag', 'Harbor Line Bag', 'Harbor Line', 'unisex', 'accessory', 'accessory', 'bag', 133.12, true, ARRAY['one'], ARRAY['black','olive'], ARRAY['smart casual','minimalistisch','winter','premium'], 'clean', 'https://example.com/images/mock-096.jpg', 'https://example.com/products/mock-096', 'https://example.com/products/mock-096', 'ASOS'),

-- mock-097
('mock-097', 'Soft Layer T-Shirt', 'Soft Layer T-Shirt', 'Soft Layer', 'unisex', 'top', 'top', 't-shirt', 31.92, true, ARRAY['L','M','S','XL'], ARRAY['white','cream','grey'], ARRAY['weekend relaxed','amsterdam streetwear','spring','budget'], 'relaxed', 'https://example.com/images/mock-097.jpg', 'https://example.com/products/mock-097', 'https://example.com/products/mock-097', 'Zalando'),

-- mock-098
('mock-098', 'Urban Nine Midi Dress', 'Urban Nine Midi Dress', 'Urban Nine', 'female', 'dress', 'dress', 'midi dress', 119.73, true, ARRAY['M','S','XS'], ARRAY['cream','olive'], ARRAY['smart casual','office ready','spring','mid'], 'tailored', 'https://example.com/images/mock-098.jpg', 'https://example.com/products/mock-098', 'https://example.com/products/mock-098', 'ASOS'),

-- mock-099
('mock-099', 'Nordic Form Jeans', 'Nordic Form Jeans', 'Nordic Form', 'unisex', 'bottom', 'bottom', 'jeans', 56.19, true, ARRAY['M','S','XL'], ARRAY['blue','charcoal'], ARRAY['amsterdam streetwear','weekend relaxed','fall','mid'], 'relaxed', 'https://example.com/images/mock-099.jpg', 'https://example.com/products/mock-099', NULL, 'Other'),

-- mock-100
('mock-100', 'Studio Jordaan Scarf', 'Studio Jordaan Scarf', 'Studio Jordaan', 'unisex', 'accessory', 'accessory', 'scarf', 27.14, true, ARRAY['one'], ARRAY['black','cream'], ARRAY['weekend relaxed','smart casual','winter','budget'], 'relaxed', 'https://example.com/images/mock-100.jpg', 'https://example.com/products/mock-100', 'https://example.com/products/mock-100', 'Zalando')

ON CONFLICT (sku) DO NOTHING;
