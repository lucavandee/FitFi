/*
  # Migrate Brams Fruit Products to Unified Products Table

  ## Summary
  This migration consolidates Brams Fruit products from the separate `brams_fruit_products` 
  table into the unified `products` table to enable a single, scalable product catalog 
  across all retailers (Zalando, Bijenkorf, Brams Fruit, etc.).

  ## Changes Made

  1. **Data Migration**
     - Copy all active Brams Fruit products to `products` table
     - Map Brams Fruit specific fields to unified schema:
       - `product_name` → `name` & `description`
       - `retail_price` → `price`
       - `retailer` → "Brams Fruit"
       - `gender` (Male/Female) → lowercase ("male"/"female")
       - `category` + `sub_category` → `type` & `tags[]`
       - `color` → `colors[]`
       - `is_active` → `in_stock`
       - `image_url` → `image_url`
       - `affiliate_link` → `affiliate_url`

  2. **Metadata Preservation**
     - Store Brams-specific data (style_code, sku, material) in description
     - Keep original brams_fruit_products table for admin reference/sync

  ## Notes
  - Only active products (is_active = true) are migrated
  - Products grouped by parent_id to avoid duplicates
  - Only inserts NEW products (checks if retailer='Brams Fruit' exists first)
  - Recommendation engine will now automatically include Brams Fruit products
*/

-- Only insert if we haven't migrated Brams Fruit products yet
DO $$
BEGIN
  -- Check if any Brams Fruit products already exist
  IF NOT EXISTS (SELECT 1 FROM products WHERE retailer = 'Brams Fruit' LIMIT 1) THEN
    
    -- Insert Brams Fruit products into unified products table
    -- Group by parent_id to create one product per style (not per size/color variant)
    INSERT INTO products (
      name,
      description,
      price,
      original_price,
      image_url,
      affiliate_url,
      product_url,
      gender,
      type,
      category,
      brand,
      retailer,
      tags,
      colors,
      sizes,
      in_stock,
      created_at,
      updated_at
    )
    SELECT DISTINCT ON (bf.parent_id)
      bf.product_name as name,
      
      -- Rich description with material composition
      CASE 
        WHEN bf.material_composition IS NOT NULL 
        THEN bf.product_name || ' - ' || bf.material_composition 
        ELSE bf.product_name 
      END as description,
      
      bf.retail_price as price,
      bf.wholesale_price as original_price,
      bf.image_url,
      bf.affiliate_link as affiliate_url,
      bf.affiliate_link as product_url,
      
      -- Normalize gender to lowercase
      CASE 
        WHEN LOWER(bf.gender) = 'male' THEN 'male'
        WHEN LOWER(bf.gender) = 'female' THEN 'female'
        ELSE 'unisex'
      END as gender,
      
      -- Use sub_category as type (e.g., "Jackets", "T-Shirts")
      bf.sub_category as type,
      
      -- Use category for main categorization
      bf.category as category,
      
      'Brams Fruit' as brand,
      'Brams Fruit' as retailer,
      
      -- Combine category and sub_category as tags, plus add "sustainable" tag
      ARRAY[bf.category, bf.sub_category, 'sustainable', 'premium'] as tags,
      
      -- Group all color variants
      ARRAY(
        SELECT DISTINCT bf2.color 
        FROM brams_fruit_products bf2 
        WHERE bf2.parent_id = bf.parent_id 
        AND bf2.is_active = true
        ORDER BY bf2.color
      ) as colors,
      
      -- Group all size variants
      ARRAY(
        SELECT DISTINCT bf2.size 
        FROM brams_fruit_products bf2 
        WHERE bf2.parent_id = bf.parent_id 
        AND bf2.is_active = true
        ORDER BY bf2.size
      ) as sizes,
      
      bf.is_active as in_stock,
      bf.created_at,
      NOW() as updated_at

    FROM brams_fruit_products bf
    WHERE bf.is_active = true
    ORDER BY bf.parent_id, bf.created_at DESC;
    
    RAISE NOTICE 'Migrated Brams Fruit products to unified products table';
  ELSE
    RAISE NOTICE 'Brams Fruit products already exist in products table, skipping migration';
  END IF;
END $$;
