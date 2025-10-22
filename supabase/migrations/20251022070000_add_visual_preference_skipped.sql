/*
  # Add Visual Preference Skip Tracking

  1. Changes
    - Add `visual_preference_skipped` column to style_profiles
    - Add `visual_preference_completed_at` timestamp for tracking when users complete swipes

  2. Purpose
    - Track users who skip the visual preference onboarding step
    - Allow them to return later via dashboard to complete
    - Improve personalization when users do complete swipes
*/

-- Add visual preference tracking columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'style_profiles' AND column_name = 'visual_preference_skipped'
  ) THEN
    ALTER TABLE style_profiles
    ADD COLUMN visual_preference_skipped boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'style_profiles' AND column_name = 'visual_preference_completed_at'
  ) THEN
    ALTER TABLE style_profiles
    ADD COLUMN visual_preference_completed_at timestamptz;
  END IF;
END $$;

-- Add index for quick lookups of users who skipped
CREATE INDEX IF NOT EXISTS style_profiles_skipped_idx
  ON style_profiles(visual_preference_skipped)
  WHERE visual_preference_skipped = true;
