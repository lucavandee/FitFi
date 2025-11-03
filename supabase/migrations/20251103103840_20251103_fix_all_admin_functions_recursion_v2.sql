/*
  # Fix All Admin Functions to Prevent Recursion (v2)

  1. Drop and recreate functions with correct signatures
  2. Use is_current_user_admin() helper to prevent recursion
*/

-- Drop existing functions
DROP FUNCTION IF EXISTS search_users(text, text, boolean, boolean, integer, integer);
DROP FUNCTION IF EXISTS set_user_tier(uuid, text, text);
DROP FUNCTION IF EXISTS set_user_admin(uuid, boolean, text);

-- Recreate search_users
CREATE FUNCTION search_users(
  p_search_term text DEFAULT NULL,
  p_tier text DEFAULT NULL,
  p_is_admin boolean DEFAULT NULL,
  p_has_referrals boolean DEFAULT NULL,
  p_limit int DEFAULT 50,
  p_offset int DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  full_name text,
  email text,
  tier text,
  is_admin boolean,
  referral_count bigint,
  created_at timestamptz,
  saved_outfits_count bigint,
  has_style_profile boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_current_user_admin() THEN
    RAISE EXCEPTION 'Unauthorized: admin access required';
  END IF;

  RETURN QUERY
  SELECT 
    p.id,
    COALESCE(p.name, 'Unknown') as full_name,
    COALESCE(au.email, 'no-email') as email,
    COALESCE(p.tier, 'free') as tier,
    COALESCE(p.is_admin, false) as is_admin,
    0::bigint as referral_count,
    p.created_at,
    0::bigint as saved_outfits_count,
    EXISTS(SELECT 1 FROM style_profiles sp WHERE sp.user_id = p.id) as has_style_profile
  FROM profiles p
  LEFT JOIN auth.users au ON au.id = p.id
  WHERE 
    (p_search_term IS NULL OR 
     p.name ILIKE '%' || p_search_term || '%' OR 
     au.email ILIKE '%' || p_search_term || '%')
    AND (p_tier IS NULL OR p.tier = p_tier)
    AND (p_is_admin IS NULL OR p.is_admin = p_is_admin)
  ORDER BY p.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Recreate set_user_tier
CREATE FUNCTION set_user_tier(
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

-- Recreate set_user_admin
CREATE FUNCTION set_user_admin(
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

  IF p_target_user_id = auth.uid() AND p_is_admin = false THEN
    RAISE EXCEPTION 'Cannot remove your own admin status';
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

-- Grant permissions
GRANT EXECUTE ON FUNCTION search_users TO authenticated;
GRANT EXECUTE ON FUNCTION set_user_tier TO authenticated;
GRANT EXECUTE ON FUNCTION set_user_admin TO authenticated;
