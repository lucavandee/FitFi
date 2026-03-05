/*
  # Fix set_user_tier — inline admin check instead of calling is_current_user_admin()

  The issue: is_current_user_admin() is a separate function call whose SECURITY
  DEFINER context may not propagate auth.uid() correctly when called from
  within another SECURITY DEFINER function.

  Fix: inline the admin check directly inside set_user_tier using a subquery
  on the profiles table — which works reliably since the outer function is
  already SECURITY DEFINER (runs as postgres, bypassing RLS).
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
  SET tier = p_tier, updated_at = NOW()
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
