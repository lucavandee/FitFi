/*
  # Admin Users Function

  1. New Function
    - `get_admin_users()` - Returns all users with email, tier, quiz status
    - Only accessible by admins

  2. Security
    - SECURITY DEFINER to access auth.users
    - Admin check at function level
*/

-- Create function to get all users (admin only)
CREATE OR REPLACE FUNCTION get_admin_users()
RETURNS TABLE (
  id uuid,
  email text,
  full_name text,
  tier text,
  is_admin boolean,
  created_at timestamptz,
  last_sign_in timestamptz,
  quiz_completed boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  -- Check if caller is admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  ) THEN
    RAISE EXCEPTION 'Access denied: admin privileges required';
  END IF;

  -- Return merged user data
  RETURN QUERY
  SELECT
    p.id,
    au.email::text,
    p.full_name,
    COALESCE(p.tier, 'free')::text as tier,
    COALESCE(p.is_admin, false) as is_admin,
    p.created_at,
    au.last_sign_in_at as last_sign_in,
    COALESCE(sp.quiz_completed, false) as quiz_completed
  FROM profiles p
  LEFT JOIN auth.users au ON au.id = p.id
  LEFT JOIN style_profiles sp ON sp.user_id = p.id
  ORDER BY p.created_at DESC;
END;
$$;
