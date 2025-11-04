/*
  # Create Separate Admin Check Infrastructure
  
  1. Problem
    - RLS on profiles prevents is_current_user_admin() from working
    - Storage policies fail because function can't read profiles
    - SECURITY DEFINER breaks auth context
    
  2. Solution
    - Create a separate view WITHOUT RLS
    - View only exposes id and is_admin (no sensitive data)
    - Function reads from view instead of profiles
    
  3. Security
    - View is read-only
    - Only exposes is_admin flag
    - No sensitive user data exposed
*/

-- Create a simple view for admin checks (no RLS)
CREATE OR REPLACE VIEW admin_status AS
SELECT id, is_admin
FROM profiles;

-- Make view accessible to everyone (it's just a boolean flag)
GRANT SELECT ON admin_status TO authenticated, anon;

-- Recreate function to use the view
DROP FUNCTION IF EXISTS is_current_user_admin() CASCADE;

CREATE OR REPLACE FUNCTION is_current_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM admin_status WHERE id = auth.uid()),
    false
  );
$$;

GRANT EXECUTE ON FUNCTION is_current_user_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION is_current_user_admin() TO anon;

-- Recreate all dependent policies
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
