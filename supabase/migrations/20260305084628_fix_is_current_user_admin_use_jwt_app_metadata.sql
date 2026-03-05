/*
  # Fix is_current_user_admin() to use JWT app_metadata

  The previous version queried the profiles table, which is blocked by RLS
  (users can only see their own row, so SELECT inside a nested function context
  can fail silently). The JWT app_metadata approach is reliable because it's
  embedded in the token itself and requires no table access.

  Both admin users already have is_admin=true in raw_app_meta_data.
*/

CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean,
    false
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_current_user_admin() TO authenticated;
