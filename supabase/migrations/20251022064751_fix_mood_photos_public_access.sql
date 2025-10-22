/*
  # Fix Mood Photos Public Access
  
  1. Changes
    - Drop restrictive authenticated-only policy
    - Add new policy allowing BOTH authenticated AND anonymous users to read mood photos
    
  2. Security
    - Mood photos are intentionally public content for onboarding
    - Read-only access (SELECT only)
    - No user data exposed
*/

-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Mood photos are publicly readable" ON mood_photos;

-- Create new public read policy for both authenticated and anonymous users
CREATE POLICY "Mood photos are publicly readable for all"
  ON mood_photos
  FOR SELECT
  TO anon, authenticated
  USING (active = true);
