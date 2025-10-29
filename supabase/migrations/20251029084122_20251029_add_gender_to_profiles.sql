/*
  # Add gender column to profiles table

  1. Changes
    - Add `gender` column to profiles table (text, nullable)
    - Valid values: 'male', 'female', or NULL
    - Default: NULL (will be set during onboarding)

  2. Notes
    - Gender is required for mood photos filtering
    - Set during quiz onboarding flow
    - Critical for visual preference step
*/

-- Add gender column to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS gender text;

-- Add comment
COMMENT ON COLUMN profiles.gender IS 'User gender for mood photo filtering (male/female)';
