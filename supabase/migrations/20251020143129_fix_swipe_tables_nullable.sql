/*
  # Fix style_swipes and outfit_calibration_feedback constraints

  1. Changes
    - Make session_id nullable in style_swipes (users can be logged in)
    - Make swipe_order nullable in style_swipes (optional field)
    - Make photo_id nullable (already is, but ensure)
    - Make mood_photo_id reference correct column name
    
  2. Reasoning
    - Logged in users don't need session_id (they have user_id)
    - Session-only users don't need user_id (they have session_id)
    - Swipe order is helpful but not critical
*/

-- Fix style_swipes table
ALTER TABLE style_swipes 
  ALTER COLUMN session_id DROP NOT NULL;

ALTER TABLE style_swipes
  ALTER COLUMN swipe_order DROP NOT NULL;

-- Check if mood_photo_id column exists, if not rename photo_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'style_swipes' AND column_name = 'mood_photo_id'
  ) THEN
    -- Add mood_photo_id if it doesn't exist
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'style_swipes' AND column_name = 'photo_id'
    ) THEN
      ALTER TABLE style_swipes RENAME COLUMN photo_id TO mood_photo_id;
    ELSE
      ALTER TABLE style_swipes ADD COLUMN mood_photo_id text;
    END IF;
  END IF;
END $$;

-- Add swipe_direction column if direction column exists but swipe_direction doesn't
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'style_swipes' AND column_name = 'swipe_direction'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'style_swipes' AND column_name = 'direction'
  ) THEN
    ALTER TABLE style_swipes RENAME COLUMN direction TO swipe_direction;
  END IF;
END $$;

-- Make direction/swipe_direction nullable
ALTER TABLE style_swipes
  ALTER COLUMN swipe_direction DROP NOT NULL;
