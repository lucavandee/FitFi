/*
  # Fix set_user_tier and set_user_admin

  Both functions call is_current_user_admin() which doesn't exist.
  Create that helper, then recreate the functions to use it correctly.
*/

CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM profiles WHERE id = auth.uid()),
    false
  );
$$;

CREATE OR REPLACE FUNCTION public.set_user_tier(
  p_target_user_id uuid,
  p_tier text,
  p_reason text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_current_user_admin() THEN
    RAISE EXCEPTION 'Unauthorized: admin access required';
  END IF;

  IF p_tier NOT IN ('free', 'premium', 'founder') THEN
    RAISE EXCEPTION 'Invalid tier: %', p_tier;
  END IF;

  UPDATE profiles
  SET tier = p_tier, updated_at = NOW()
  WHERE id = p_target_user_id;

  INSERT INTO admin_audit_log (admin_id, action, target_user_id, details)
  VALUES (
    auth.uid(),
    'set_user_tier',
    p_target_user_id,
    jsonb_build_object('tier', p_tier, 'reason', p_reason)
  );

  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_user_admin(
  p_target_user_id uuid,
  p_is_admin boolean,
  p_reason text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_current_user_admin() THEN
    RAISE EXCEPTION 'Unauthorized: admin access required';
  END IF;

  UPDATE profiles
  SET is_admin = p_is_admin, updated_at = NOW()
  WHERE id = p_target_user_id;

  INSERT INTO admin_audit_log (admin_id, action, target_user_id, details)
  VALUES (
    auth.uid(),
    'set_user_admin',
    p_target_user_id,
    jsonb_build_object('is_admin', p_is_admin, 'reason', p_reason)
  );

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_current_user_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_user_tier(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_user_admin(uuid, boolean, text) TO authenticated;
