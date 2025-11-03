/*
  # Add Admin Functions for User Management

  1. Problem
    - RLS policies can't check is_admin without infinite recursion
    - Admins need to manage other users
    
  2. Solution
    - Create SECURITY DEFINER functions for admin operations
    - Functions run with elevated privileges
    - Check admin status inside function (no recursion)
    
  3. Functions
    - admin_get_all_users() - Get all profiles for admin dashboard
    - admin_update_user_tier() - Update user tier
    - admin_update_user_admin_status() - Grant/revoke admin
*/

-- Function to check if current user is admin (no recursion because it's a function)
CREATE OR REPLACE FUNCTION is_current_user_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_is_admin boolean;
BEGIN
  SELECT is_admin INTO user_is_admin
  FROM profiles
  WHERE id = auth.uid();
  
  RETURN COALESCE(user_is_admin, false);
END;
$$;

-- Function to get all users (admin only)
CREATE OR REPLACE FUNCTION admin_get_all_users()
RETURNS TABLE (
  id uuid,
  email text,
  name text,
  tier text,
  is_admin boolean,
  gender text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if current user is admin
  IF NOT is_current_user_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  RETURN QUERY
  SELECT 
    p.id,
    au.email,
    p.name,
    p.tier,
    p.is_admin,
    p.gender,
    p.created_at,
    p.updated_at
  FROM profiles p
  LEFT JOIN auth.users au ON au.id = p.id
  ORDER BY p.created_at DESC;
END;
$$;

-- Function to update user tier (admin only)
CREATE OR REPLACE FUNCTION admin_update_user_tier(
  target_user_id uuid,
  new_tier text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if current user is admin
  IF NOT is_current_user_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  -- Validate tier
  IF new_tier NOT IN ('free', 'premium', 'founder') THEN
    RAISE EXCEPTION 'Invalid tier: must be free, premium, or founder';
  END IF;

  -- Update tier
  UPDATE profiles
  SET 
    tier = new_tier,
    updated_at = now()
  WHERE id = target_user_id;

  -- Log action
  INSERT INTO admin_audit_log (admin_id, action, details)
  VALUES (
    auth.uid(),
    'update_user_tier',
    jsonb_build_object(
      'user_id', target_user_id,
      'new_tier', new_tier
    )
  );
END;
$$;

-- Function to update user admin status (admin only)
CREATE OR REPLACE FUNCTION admin_update_user_admin_status(
  target_user_id uuid,
  new_admin_status boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if current user is admin
  IF NOT is_current_user_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  -- Prevent self-demotion
  IF target_user_id = auth.uid() AND new_admin_status = false THEN
    RAISE EXCEPTION 'Cannot remove your own admin status';
  END IF;

  -- Update admin status
  UPDATE profiles
  SET 
    is_admin = new_admin_status,
    updated_at = now()
  WHERE id = target_user_id;

  -- Log action
  INSERT INTO admin_audit_log (admin_id, action, details)
  VALUES (
    auth.uid(),
    'update_admin_status',
    jsonb_build_object(
      'user_id', target_user_id,
      'new_status', new_admin_status
    )
  );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION is_current_user_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION admin_get_all_users() TO authenticated;
GRANT EXECUTE ON FUNCTION admin_update_user_tier(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_update_user_admin_status(uuid, boolean) TO authenticated;
