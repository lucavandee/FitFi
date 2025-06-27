-- Add seasonal_event_progress column to user_gamification table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_gamification' 
    AND column_name = 'seasonal_event_progress'
  ) THEN
    ALTER TABLE user_gamification ADD COLUMN seasonal_event_progress JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;