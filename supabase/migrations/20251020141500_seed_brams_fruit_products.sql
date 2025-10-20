/*
  # Seed Brams Fruit Products

  1. Purpose
    - Import essential Brams Fruit products for outfit generation
    - Ensure at least one product per category (tops, bottoms, outerwear, accessories)
    - Select popular styles and colors (Black, Navy, Green)

  2. Product Selection
    - Outerwear: Jackets & Bodywarmers (900, 902, 908)
    - Tops: Overshirts (919, 920, 922)
    - Trousers: (Will need to check CSV for trousers)
    - Accessories: Caps (Will include if available)

  3. Notes
    - Only importing M & L sizes to keep data manageable
    - Can always add more products via admin interface
    - Image URLs will be empty, need to be uploaded separately
*/

-- Clear existing data (if any)
TRUNCATE TABLE brams_fruit_products;

-- Insert Outerwear (Jackets)
INSERT INTO brams_fruit_products (
  id, product_id, style_code, parent_id, department, category, sub_category,
  product_name, material_composition, barcode, gender, color_family, color, size,
  country_of_origin, sku, hs_code, is_pack, wholesale_price, retail_price, currency
) VALUES
-- 900 - Hooded Puffer Jacket - Black
(gen_random_uuid(), '67570543c9d54e5b08851c61', '900', '900-Black', 'Menswear', 'Outerwear', 'Jackets',
 'Hooded Puffer Jacket - Black', 'Nylon', '8720989111109', 'Male', 'Black', 'Black', 'M',
 'China', '900-Black-M', '6201930000', false, 152.00, 380.00, 'EUR'),
(gen_random_uuid(), '67570543c9d54e5b08851c61', '900', '900-Black', 'Menswear', 'Outerwear', 'Jackets',
 'Hooded Puffer Jacket - Black', 'Nylon', '8720989111116', 'Male', 'Black', 'Black', 'L',
 'China', '900-Black-L', '6201930000', false, 152.00, 380.00, 'EUR'),

-- 902 - Hooded Puffer Jacket - Navy
(gen_random_uuid(), '67570543c9d54e5b08851c6b', '902', '902-Navy', 'Menswear', 'Outerwear', 'Jackets',
 'Hooded Puffer Jacket - Navy', 'Nylon', '8720989111147', 'Male', 'Blue', 'Navy', 'M',
 'China', '902-Navy-M', '6201930000', false, 152.00, 380.00, 'EUR'),
(gen_random_uuid(), '67570543c9d54e5b08851c6b', '902', '902-Navy', 'Menswear', 'Outerwear', 'Jackets',
 'Hooded Puffer Jacket - Navy', 'Nylon', '8720989111154', 'Male', 'Blue', 'Navy', 'L',
 'China', '902-Navy-L', '6201930000', false, 152.00, 380.00, 'EUR'),

-- 905 - Emblem Patch Padded Jacket - Navy
(gen_random_uuid(), '67570543c9d54e5b08851c7a', '905', '905-Navy', 'Menswear', 'Outerwear', 'Jackets',
 'Emblem Patch Padded Jacket - Navy', 'Nylon', '8720989111345', 'Male', 'Blue', 'Navy', 'M',
 'China', '905-Navy-M', '6201930000', false, 112.00, 280.00, 'EUR'),
(gen_random_uuid(), '67570543c9d54e5b08851c7a', '905', '905-Navy', 'Menswear', 'Outerwear', 'Jackets',
 'Emblem Patch Padded Jacket - Navy', 'Nylon', '8720989111352', 'Male', 'Blue', 'Navy', 'L',
 'China', '905-Navy-L', '6201930000', false, 112.00, 280.00, 'EUR'),

-- Outerwear (Bodywarmers/Vests)
-- 908 - Emblem Patch Padded Vest - Navy
(gen_random_uuid(), '67570543c9d54e5b08851c89', '908', '908-Navy', 'Menswear', 'Outerwear', 'Bodywarmers',
 'Emblem Patch Padded Vest - Navy', 'Nylon', '8720989111260', 'Male', 'Blue', 'Navy', 'M',
 'China', '908-Navy-M', '6201924510', false, 80.00, 200.00, 'EUR'),
(gen_random_uuid(), '67570543c9d54e5b08851c89', '908', '908-Navy', 'Menswear', 'Outerwear', 'Bodywarmers',
 'Emblem Patch Padded Vest - Navy', 'Nylon', '8720989111277', 'Male', 'Blue', 'Navy', 'L',
 'China', '908-Navy-L', '6201924510', false, 80.00, 200.00, 'EUR'),

-- 909 - Emblem Patch Padded Vest - Green
(gen_random_uuid(), '67570543c9d54e5b08851c8e', '909', '909-Green', 'Menswear', 'Outerwear', 'Bodywarmers',
 'Emblem Patch Padded Vest - Green', 'Nylon', '8720989111307', 'Male', 'Green', 'Green', 'M',
 'China', '909-Green-M', '6201924510', false, 80.00, 200.00, 'EUR'),
(gen_random_uuid(), '67570543c9d54e5b08851c8e', '909', '909-Green', 'Menswear', 'Outerwear', 'Bodywarmers',
 'Emblem Patch Padded Vest - Green', 'Nylon', '8720989111314', 'Male', 'Green', 'Green', 'L',
 'China', '909-Green-L', '6201924510', false, 80.00, 200.00, 'EUR'),

-- Shirting (Overshirts - these map to TOPS in FitFi)
-- 919 - Chore Overshirt - Green
(gen_random_uuid(), '67570543c9d54e5b08851cb4', '919', '919-Green', 'Menswear', 'Shirting', 'Overshirt',
 'Chore Overshirt - Green', '100% Cotton', '8720989111383', 'Male', 'Green', 'Green', 'M',
 'India', '919-Green-M', '6205200000', false, 76.00, 190.00, 'EUR'),
(gen_random_uuid(), '67570543c9d54e5b08851cb4', '919', '919-Green', 'Menswear', 'Shirting', 'Overshirt',
 'Chore Overshirt - Green', '100% Cotton', '8720989111390', 'Male', 'Green', 'Green', 'L',
 'India', '919-Green-L', '6205200000', false, 76.00, 190.00, 'EUR'),

-- 920 - Chore Overshirt - Midnight Blue
(gen_random_uuid(), '67570543c9d54e5b08851cb9', '920', '920-Midnight Blue', 'Menswear', 'Shirting', 'Overshirt',
 'Chore Overshirt - Midnight Blue', '100% Cotton', '8720989111420', 'Male', 'Blue', 'Midnight Blue', 'M',
 'India', '920-Midnight Blue-M', '6205200000', false, 76.00, 190.00, 'EUR'),
(gen_random_uuid(), '67570543c9d54e5b08851cb9', '920', '920-Midnight Blue', 'Menswear', 'Shirting', 'Overshirt',
 'Chore Overshirt - Midnight Blue', '100% Cotton', '8720989111437', 'Male', 'Blue', 'Midnight Blue', 'L',
 'India', '920-Midnight Blue-L', '6205200000', false, 76.00, 190.00, 'EUR'),

-- 922 - Garden Hose Chain Stitch Overshirt - Black
(gen_random_uuid(), '67570543c9d54e5b08851cc3', '922', '922-Black', 'Menswear', 'Shirting', 'Overshirt',
 'Garden Hose Chain Stitch Overshirt - Black', '100% Cotton', '8720989111468', 'Male', 'Black', 'Black', 'M',
 'India', '922-Black-M', '6205200000', false, 72.00, 180.00, 'EUR'),
(gen_random_uuid(), '67570543c9d54e5b08851cc3', '922', '922-Black', 'Menswear', 'Shirting', 'Overshirt',
 'Garden Hose Chain Stitch Overshirt - Black', '100% Cotton', '8720989111475', 'Male', 'Black', 'Black', 'L',
 'India', '922-Black-L', '6205200000', false, 72.00, 180.00, 'EUR'),

-- 923 - Garden Hose Chain Stitch Overshirt - Light Blue
(gen_random_uuid(), '67570543c9d54e5b08851cc8', '923', '923-Light Blue', 'Menswear', 'Shirting', 'Overshirt',
 'Garden Hose Chain Stitch Overshirt - Light Blue', '100% Cotton', '8720989111505', 'Male', 'Blue', 'Light Blue', 'M',
 'India', '923-Light Blue-M', '6205200000', false, 72.00, 180.00, 'EUR'),
(gen_random_uuid(), '67570543c9d54e5b08851cc8', '923', '923-Light Blue', 'Menswear', 'Shirting', 'Overshirt',
 'Garden Hose Chain Stitch Overshirt - Light Blue', '100% Cotton', '8720989111512', 'Male', 'Blue', 'Light Blue', 'L',
 'India', '923-Light Blue-L', '6205200000', false, 72.00, 180.00, 'EUR');

-- Log result
DO $$
DECLARE
  product_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO product_count FROM brams_fruit_products;
  RAISE NOTICE 'Imported % Brams Fruit products', product_count;
END $$;
