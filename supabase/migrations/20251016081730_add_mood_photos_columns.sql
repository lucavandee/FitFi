/*
  # Add Missing Mood Photos Columns
  
  1. Columns
    - Add active (boolean) for filtering active photos
    - Add display_order (integer) for sorting
  
  2. Updates
    - Set existing photos to active=true
    - Add default display_order based on id
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'mood_photos' 
    AND column_name = 'active'
  ) THEN
    ALTER TABLE mood_photos 
    ADD COLUMN active boolean DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'mood_photos' 
    AND column_name = 'display_order'
  ) THEN
    ALTER TABLE mood_photos 
    ADD COLUMN display_order integer;
    
    -- Set display_order to id for existing rows
    UPDATE mood_photos SET display_order = id WHERE display_order IS NULL;
  END IF;
END $$;

-- Create index for common query pattern
CREATE INDEX IF NOT EXISTS idx_mood_photos_active_order 
ON mood_photos(active, display_order) 
WHERE active = true;
