/*
  # Debug Admin Function
  
  Add logging to understand why function returns false
*/

DROP FUNCTION IF EXISTS is_current_user_admin() CASCADE;

CREATE OR REPLACE FUNCTION is_current_user_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_uid uuid;
  user_is_admin boolean;
BEGIN
  -- Get current user ID
  current_uid := auth.uid();
  
  -- Log to server (will show in Supabase logs)
  RAISE NOTICE 'is_current_user_admin called: uid=%', current_uid;
  
  IF current_uid IS NULL THEN
    RAISE NOTICE 'auth.uid() is NULL - user not authenticated';
    RETURN false;
  END IF;
  
  -- Try to get admin status
  SELECT is_admin INTO user_is_admin
  FROM admin_status
  WHERE id = current_uid;
  
  RAISE NOTICE 'Admin check result: uid=%, is_admin=%', current_uid, user_is_admin;
  
  RETURN COALESCE(user_is_admin, false);
END;
$$;

GRANT EXECUTE ON FUNCTION is_current_user_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION is_current_user_admin() TO anon;

-- Recreate storage policies
DROP POLICY IF EXISTS "Admins can upload mood photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update mood photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete mood photos" ON storage.objects;

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
