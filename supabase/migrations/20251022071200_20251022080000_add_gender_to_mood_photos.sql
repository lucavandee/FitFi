/*
  # Add Gender Column to Mood Photos

  1. Schema Changes
    - Add `gender` column to mood_photos table
    - Values: 'male', 'female', 'unisex'
    - Create index for gender-based filtering

  2. Data Migration
    - Set existing photos to appropriate gender
    - Based on image URLs and style characteristics

  3. Security
    - No RLS changes needed (table already has policies)
*/

-- Add gender column with constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'mood_photos'
    AND column_name = 'gender'
  ) THEN
    ALTER TABLE mood_photos
    ADD COLUMN gender text CHECK (gender IN ('male', 'female', 'unisex')) DEFAULT 'female';

    -- Create composite index for gender + active filtering
    CREATE INDEX IF NOT EXISTS idx_mood_photos_gender_active
      ON mood_photos(gender, active, display_order)
      WHERE active = true;

    -- Log completion
    RAISE NOTICE 'Gender column added to mood_photos with index';
  END IF;
END $$;

-- Migrate existing photos to appropriate gender
-- Based on the seeded photo URLs and style characteristics
UPDATE mood_photos
SET gender = CASE
  -- Female-coded images (dresses, romantic, bohemian)
  WHEN image_url LIKE '%1926769%' THEN 'female'  -- Scandinavian Minimal
  WHEN image_url LIKE '%1484794%' THEN 'female'  -- Bohemian Artistic
  WHEN image_url LIKE '%1055691%' THEN 'female'  -- Romantic Feminine
  WHEN image_url LIKE '%1926620%' THEN 'female'  -- Bold Statement

  -- Male-coded images (menswear, tailored, street)
  WHEN image_url LIKE '%1222271%' THEN 'male'    -- Street Refined
  WHEN image_url LIKE '%2897883%' THEN 'male'    -- Italian Smart Casual

  -- Unisex (minimalist, athleisure, casual)
  WHEN image_url LIKE '%2526878%' THEN 'unisex'  -- Athleisure
  WHEN image_url LIKE '%1933873%' THEN 'unisex'  -- Monochrome Sophisticated
  WHEN image_url LIKE '%1080213%' THEN 'unisex'  -- Coastal Casual
  WHEN image_url LIKE '%1536619%' THEN 'unisex'  -- Classic Preppy

  ELSE 'female'  -- Default to female for unrecognized
END
WHERE gender IS NULL OR gender = 'female';  -- Only update default values
