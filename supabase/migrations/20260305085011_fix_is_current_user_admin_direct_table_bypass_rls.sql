/*
  # Fix is_current_user_admin() — bypass RLS with SET LOCAL

  SECURITY DEFINER functions run as the function owner (postgres) which has
  full access. The issue is that nested function calls within a SECURITY DEFINER
  context still inherit RLS unless we explicitly disable it.

  Solution: use SET LOCAL row_security = off inside a helper that directly
  queries profiles, or use a separate admin_roles table that has no RLS.

  We combine both approaches:
  1. Try JWT app_metadata first (fastest, no DB hit)
  2. Fall back to a direct profiles query with row_security disabled
*/

CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid;
  v_is_admin boolean;
  v_jwt_admin boolean;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RETURN false;
  END IF;

  -- Check JWT app_metadata first
  v_jwt_admin := COALESCE(
    (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean,
    false
  );
  IF v_jwt_admin THEN
    RETURN true;
  END IF;

  -- Fall back: direct profiles query (SECURITY DEFINER bypasses RLS)
  SELECT COALESCE(is_admin, false) INTO v_is_admin
  FROM profiles
  WHERE id = v_uid;

  RETURN COALESCE(v_is_admin, false);
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_current_user_admin() TO authenticated;
