/*
  # Fix Mood Photos Policies - Prevent Recursion

  1. Problem
    - Current policies check profiles.is_admin directly
    - This causes infinite recursion (same issue as before)
    - Admins can't see inactive photos (SELECT only shows active=true)
    
  2. Solution
    - Drop all current policies
    - Create new policies using is_current_user_admin() helper
    - Add separate SELECT policy for admins to see all photos
    
  3. Security
    - Public can only SELECT active photos
    - Admins can SELECT all photos (including inactive)
    - Only admins can INSERT/UPDATE/DELETE
*/

-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Mood photos are publicly readable for all" ON mood_photos;
DROP POLICY IF EXISTS "Admins can insert mood photos" ON mood_photos;
DROP POLICY IF EXISTS "Admins can update mood photos" ON mood_photos;
DROP POLICY IF EXISTS "Admins can delete mood photos" ON mood_photos;

-- Public can view active photos
CREATE POLICY "Public can view active mood photos"
ON mood_photos FOR SELECT
TO public
USING (active = true);

-- Admins can view ALL photos (including inactive)
CREATE POLICY "Admins can view all mood photos"
ON mood_photos FOR SELECT
TO authenticated
USING (is_current_user_admin());

-- Admins can insert photos
CREATE POLICY "Admins can insert mood photos"
ON mood_photos FOR INSERT
TO authenticated
WITH CHECK (is_current_user_admin());

-- Admins can update photos
CREATE POLICY "Admins can update mood photos"
ON mood_photos FOR UPDATE
TO authenticated
USING (is_current_user_admin())
WITH CHECK (is_current_user_admin());

-- Admins can delete photos
CREATE POLICY "Admins can delete mood photos"
ON mood_photos FOR DELETE
TO authenticated
USING (is_current_user_admin());
