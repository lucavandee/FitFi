/*
  # Fix is_current_user_admin() with Direct Auth Check
  
  1. Problem
    - Function may still be hitting RLS when checking profiles
    - Storage policies fail because function can't verify admin status
    
  2. Solution
    - Rewrite function to bypass ALL RLS
    - Use direct table access with SECURITY DEFINER
    - Set search_path to prevent any RLS issues
    
  3. Testing
    - Function must work when called from storage policies
    - Must return true for luc@fitfi.ai
*/

-- Drop existing function
DROP FUNCTION IF EXISTS is_current_user_admin() CASCADE;

-- Create new function that GUARANTEES RLS bypass
CREATE OR REPLACE FUNCTION is_current_user_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM profiles WHERE id = auth.uid() LIMIT 1),
    false
  );
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION is_current_user_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION is_current_user_admin() TO anon;

-- Recreate ALL policies that depend on this function

-- Mood photos table policies
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
