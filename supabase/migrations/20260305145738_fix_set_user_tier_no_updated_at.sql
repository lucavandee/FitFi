/*
  # Fix set_user_tier — remove updated_at (column does not exist on profiles)

  The profiles table has no updated_at column. The function was trying to set it,
  causing a "column does not exist" error on every tier change attempt.
  
  Fix: remove updated_at from the UPDATE statement.
*/

CREATE OR REPLACE FUNCTION public.set_user_tier(
  p_target_user_id uuid,
  p_tier text,
  p_reason text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
DECLARE
  v_caller_id uuid;
  v_is_admin boolean;
BEGIN
  v_caller_id := auth.uid();

  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: not authenticated';
  END IF;

  SELECT COALESCE(is_admin, false) INTO v_is_admin
  FROM profiles
  WHERE id = v_caller_id;

  IF NOT COALESCE(v_is_admin, false) THEN
    RAISE EXCEPTION 'Unauthorized: admin access required';
  END IF;

  IF p_tier NOT IN ('free', 'premium', 'founder') THEN
    RAISE EXCEPTION 'Invalid tier: %', p_tier;
  END IF;

  UPDATE profiles
  SET tier = p_tier
  WHERE id = p_target_user_id;

  INSERT INTO admin_audit_log (admin_id, action, target_user_id, details)
  VALUES (
    v_caller_id,
    'set_user_tier',
    p_target_user_id,
    jsonb_build_object('tier', p_tier, 'reason', p_reason)
  );

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.set_user_tier(uuid, text, text) TO authenticated;
