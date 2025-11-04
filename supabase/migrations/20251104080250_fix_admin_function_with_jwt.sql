/*
  # Fix Admin Function - Use JWT Directly
  
  1. Problem
    - auth.uid() returns NULL in some contexts
    - Function can't verify admin status
    
  2. Solution
    - Extract user ID from JWT claims directly
    - More reliable than auth.uid() helper
    
  3. JWT Structure
    - JWT contains 'sub' claim with user UUID
    - Can be accessed via current_setting('request.jwt.claims')
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
  jwt_claims json;
BEGIN
  -- Try auth.uid() first
  current_uid := auth.uid();
  
  -- If that's NULL, try extracting from JWT directly
  IF current_uid IS NULL THEN
    BEGIN
      jwt_claims := current_setting('request.jwt.claims', true)::json;
      IF jwt_claims IS NOT NULL THEN
        current_uid := (jwt_claims->>'sub')::uuid;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      current_uid := NULL;
    END;
  END IF;
  
  -- Log for debugging
  RAISE NOTICE 'Admin check: uid=%, auth.uid()=%', current_uid, auth.uid();
  
  IF current_uid IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check admin status from view (bypasses RLS)
  SELECT is_admin INTO user_is_admin
  FROM admin_status
  WHERE id = current_uid;
  
  RETURN COALESCE(user_is_admin, false);
END;
$$;

GRANT EXECUTE ON FUNCTION is_current_user_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION is_current_user_admin() TO anon;

-- Recreate policies (they were CASCADE dropped)
DROP POLICY IF EXISTS "Admins can view all mood photos" ON mood_photos;
DROP POLICY IF EXISTS "Admins can insert mood photos" ON mood_photos;
DROP POLICY IF EXISTS "Admins can update mood photos" ON mood_photos;
DROP POLICY IF EXISTS "Admins can delete mood photos" ON mood_photos;

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
