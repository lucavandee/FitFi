/*
  # Add Gender Field to Style Profiles

  1. Changes
    - Add `gender` column to `style_profiles` table
    - Type: text with constraint (male, female, non-binary, prefer-not-to-say)
    - Default: NULL (unknown)
    - Not required initially (can be added later)

  2. Purpose
    - Prevent AI from making gender assumptions
    - Enable gender-appropriate outfit recommendations
    - Respect user identity

  3. Notes
    - NULL = gender not yet provided (AI must ask, not assume!)
    - Can be set during onboarding or profile update
    - Used in Nova AI context for accurate advice
*/

-- Add gender column
ALTER TABLE style_profiles
ADD COLUMN IF NOT EXISTS gender text
CHECK (gender IN ('male', 'female', 'non-binary', 'prefer-not-to-say'));

-- Add comment for documentation
COMMENT ON COLUMN style_profiles.gender IS 'User gender for style recommendations. NULL = unknown (AI must ask, not assume)';
