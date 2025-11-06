/*
  # Add style column to products table

  1. Changes
    - Add `style` column to products table (text, nullable)
    - This column stores style keywords like "minimal", "urban", "classic", etc.

  2. Notes
    - Existing products will have NULL style values
    - Can be populated later via admin interface or migration
*/

-- Add style column
ALTER TABLE products ADD COLUMN IF NOT EXISTS style text;

-- Create index for faster style-based queries
CREATE INDEX IF NOT EXISTS idx_products_style ON products(style) WHERE style IS NOT NULL;
