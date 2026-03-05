/*
  # Admin User Detail RPC & Enhanced User Management

  ## Summary
  Adds a comprehensive RPC function for admins to retrieve full user details.
  Drops and recreates get_admin_users with additional columns for subscription
  status and referral count.

  ## Changes
  - DROP + RECREATE `get_admin_users()` with new columns: referral_count, subscription_status
  - NEW `get_user_detail(p_user_id uuid)` returning full jsonb detail

  ## Security
  - Both functions are SECURITY DEFINER, check admin status internally
  - Only admins can call these functions
*/

-- Drop existing function so we can change return type
DROP FUNCTION IF EXISTS get_admin_users();

-- Recreate with extra columns
CREATE OR REPLACE FUNCTION get_admin_users()
RETURNS TABLE (
  id uuid,
  email text,
  full_name text,
  tier text,
  is_admin boolean,
  created_at timestamptz,
  last_sign_in timestamptz,
  quiz_completed boolean,
  referral_count integer,
  subscription_status text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_admin boolean;
BEGIN
  SELECT profiles.is_admin INTO v_is_admin
  FROM profiles
  WHERE profiles.id = auth.uid();

  IF NOT COALESCE(v_is_admin, false) THEN
    RAISE EXCEPTION 'Access denied: admin only';
  END IF;

  RETURN QUERY
  SELECT
    p.id,
    au.email,
    p.full_name,
    COALESCE(p.tier, 'free') AS tier,
    COALESCE(p.is_admin, false) AS is_admin,
    p.created_at,
    au.last_sign_in_at AS last_sign_in,
    (sp.id IS NOT NULL) AS quiz_completed,
    COALESCE(p.referral_count, 0) AS referral_count,
    cs.status AS subscription_status
  FROM profiles p
  JOIN auth.users au ON au.id = p.id
  LEFT JOIN style_profiles sp ON sp.user_id = p.id
  LEFT JOIN LATERAL (
    SELECT status
    FROM customer_subscriptions
    WHERE user_id = p.id
    ORDER BY created_at DESC
    LIMIT 1
  ) cs ON true
  ORDER BY p.created_at DESC;
END;
$$;

-- New: Full user detail for admin drawer
CREATE OR REPLACE FUNCTION get_user_detail(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
  v_is_admin boolean;
BEGIN
  SELECT profiles.is_admin INTO v_is_admin
  FROM profiles
  WHERE profiles.id = auth.uid();

  IF NOT COALESCE(v_is_admin, false) THEN
    RAISE EXCEPTION 'Access denied: admin only';
  END IF;

  SELECT jsonb_build_object(
    'id', p.id,
    'email', au.email,
    'full_name', p.full_name,
    'avatar_url', p.avatar_url,
    'tier', COALESCE(p.tier, 'free'),
    'is_admin', COALESCE(p.is_admin, false),
    'created_at', p.created_at,
    'updated_at', p.updated_at,
    'last_sign_in', au.last_sign_in_at,
    'referral_code', p.referral_code,
    'referral_count', COALESCE(p.referral_count, 0),
    'gender', sp.gender,
    'quiz_completed', sp.id IS NOT NULL,
    'style_archetype', sp.archetype,
    'subscription_status', cs.status,
    'subscription_product', cs.stripe_product_id,
    'subscription_period_end', cs.current_period_end,
    'cancel_at_period_end', cs.cancel_at_period_end,
    'saved_outfits_count', (
      SELECT COUNT(*) FROM saved_outfits WHERE user_id = p.id
    ),
    'swipe_count', (
      SELECT COUNT(*) FROM style_swipes WHERE user_id = p.id
    ),
    'email_confirmed', au.email_confirmed_at IS NOT NULL
  )
  INTO v_result
  FROM profiles p
  JOIN auth.users au ON au.id = p.id
  LEFT JOIN style_profiles sp ON sp.user_id = p.id
  LEFT JOIN LATERAL (
    SELECT status, stripe_product_id, current_period_end, cancel_at_period_end
    FROM customer_subscriptions
    WHERE user_id = p.id
    ORDER BY created_at DESC
    LIMIT 1
  ) cs ON true
  WHERE p.id = p_user_id;

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION get_admin_users() TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_detail(uuid) TO authenticated;
