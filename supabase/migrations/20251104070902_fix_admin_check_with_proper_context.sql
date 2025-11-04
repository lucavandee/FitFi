/*
  # Fix Admin Check - Proper Auth Context
  
  1. Root Cause
    - SECURITY DEFINER makes function run as postgres user
    - RLS policies on profiles only allow "auth.uid() = id"
    - Function can't read profiles because auth.uid() is NULL in postgres context
    
  2. Solution
    - Don't use SECURITY DEFINER (causes context switch)
    - Use simple STABLE function that runs in user context
    - RLS will allow user to read their own profile
    
  3. Alternative
    - Add a permissive RLS policy that allows reading is_admin column
*/

-- Drop existing function
DROP FUNCTION IF EXISTS is_current_user_admin() CASCADE;

-- Create function WITHOUT SECURITY DEFINER
-- This runs in the user's context, so RLS works normally
CREATE OR REPLACE FUNCTION is_current_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM profiles WHERE id = auth.uid()),
    false
  );
$$;

GRANT EXECUTE ON FUNCTION is_current_user_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION is_current_user_admin() TO anon;

-- Recreate ALL dependent policies
DROP POLICY IF EXISTS "Public can view active mood photos" ON mood_photos;
DROP POLICY IF EXISTS "Admins can view all mood photos" ON mood_photos;
DROP POLICY IF EXISTS "Admins can insert mood photos" ON mood_photos;
DROP POLICY IF EXISTS "Admins can update mood photos" ON mood_photos;
DROP POLICY IF EXISTS "Admins can delete mood photos" ON mood_photos;

CREATE POLICY "Public can view active mood photos"
  ON mood_photos FOR SELECT
  TO public
  USING (active = true);

CREATE POLICY "Admins can view all mood photos"
  ON mood_photos FOR SELECT
  TO authenticated
  USING (is_current_user_admin());

CREATE POLICY "Admins can insert mood photos"
  ON mood_photos FOR INSERT
  TO authenticated
  WITH CHECK (is_current_user_admin());

CREATE POLICY "Admins can update mood photos"
  ON mood_photos FOR UPDATE
  TO authenticated
  USING (is_current_user_admin())
  WITH CHECK (is_current_user_admin());

CREATE POLICY "Admins can delete mood photos"
  ON mood_photos FOR DELETE
  TO authenticated
  USING (is_current_user_admin());

-- Storage policies
DROP POLICY IF EXISTS "Public can view mood photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload mood photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update mood photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete mood photos" ON storage.objects;

CREATE POLICY "Public can view mood photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'mood-photos');

CREATE POLICY "Admins can upload mood photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'mood-photos' 
  AND is_current_user_admin()
);

CREATE POLICY "Admins can update mood photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'mood-photos'
  AND is_current_user_admin()
)
WITH CHECK (
  bucket_id = 'mood-photos'
  AND is_current_user_admin()
);

CREATE POLICY "Admins can delete mood photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'mood-photos'
  AND is_current_user_admin()
);
