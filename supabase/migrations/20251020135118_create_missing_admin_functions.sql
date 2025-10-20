/*
  # Missing Admin Dashboard Functions

  1. Functions
    - get_admin_metrics() - Returns real-time dashboard metrics
    - search_users() - Search users with filters
    - get_dashboard_metrics() - Complete dashboard metrics
    
  2. Security
    - All functions require admin access via profiles.is_admin
*/

-- Get real-time admin metrics
CREATE OR REPLACE FUNCTION get_admin_metrics()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_metrics jsonb;
BEGIN
  -- Check admin permission
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true) THEN
    RAISE EXCEPTION 'Unauthorized: admin access required';
  END IF;

  SELECT jsonb_build_object(
    'total_users', (SELECT COUNT(*) FROM profiles),
    'admins', (SELECT COUNT(*) FROM profiles WHERE is_admin = true),
    'free_users', (SELECT COUNT(*) FROM profiles WHERE tier = 'free'),
    'premium_users', (SELECT COUNT(*) FROM profiles WHERE tier = 'premium'),
    'founder_users', (SELECT COUNT(*) FROM profiles WHERE tier = 'founder'),
    'style_profiles', (SELECT COUNT(*) FROM style_profiles),
    'saved_outfits', (SELECT COUNT(*) FROM user_saved_outfits),
    'quiz_completed', (SELECT COUNT(*) FROM style_profiles WHERE completed_at IS NOT NULL),
    'growth_30d', (SELECT COUNT(*) FROM profiles WHERE created_at > now() - interval '30 days'),
    'growth_7d', (SELECT COUNT(*) FROM profiles WHERE created_at > now() - interval '7 days'),
    'active_sessions', (SELECT COUNT(*) FROM admin_user_sessions WHERE ended_at IS NULL)
  ) INTO v_metrics;
  
  RETURN v_metrics;
END;
$$;

-- Search users with filters
CREATE OR REPLACE FUNCTION search_users(
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
  referral_count int,
  created_at timestamptz,
  saved_outfits_count bigint,
  has_style_profile boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check admin permission
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true) THEN
    RAISE EXCEPTION 'Unauthorized: admin access required';
  END IF;

  RETURN QUERY
  SELECT 
    p.id,
    p.full_name,
    u.email,
    p.tier,
    p.is_admin,
    COALESCE(p.referral_count, 0) as referral_count,
    p.created_at,
    (SELECT COUNT(*) FROM user_saved_outfits WHERE user_id = p.id) as saved_outfits_count,
    EXISTS(SELECT 1 FROM style_profiles WHERE user_id = p.id) as has_style_profile
  FROM profiles p
  JOIN auth.users u ON u.id = p.id
  WHERE
    (p_search_term IS NULL OR 
      p.full_name ILIKE '%' || p_search_term || '%' OR 
      u.email ILIKE '%' || p_search_term || '%')
    AND (p_tier IS NULL OR p.tier = p_tier)
    AND (p_is_admin IS NULL OR p.is_admin = p_is_admin)
    AND (p_has_referrals IS NULL OR (p_has_referrals = true AND p.referral_count > 0) OR (p_has_referrals = false AND COALESCE(p.referral_count, 0) = 0))
  ORDER BY p.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Get dashboard metrics (complete version)
CREATE OR REPLACE FUNCTION get_dashboard_metrics()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_users int;
  v_metrics jsonb;
BEGIN
  -- Check admin permission
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true) THEN
    RAISE EXCEPTION 'Unauthorized: admin access required';
  END IF;

  SELECT COUNT(*) INTO v_total_users FROM profiles;

  SELECT jsonb_build_object(
    'total_users', v_total_users,
    'admin_count', (SELECT COUNT(*) FROM profiles WHERE is_admin = true),
    'tier_breakdown', jsonb_build_object(
      'free', (SELECT COUNT(*) FROM profiles WHERE tier = 'free'),
      'premium', (SELECT COUNT(*) FROM profiles WHERE tier = 'premium'),
      'founder', (SELECT COUNT(*) FROM profiles WHERE tier = 'founder')
    ),
    'growth', jsonb_build_object(
      'last_7d', (SELECT COUNT(*) FROM profiles WHERE created_at > now() - interval '7 days'),
      'last_30d', (SELECT COUNT(*) FROM profiles WHERE created_at > now() - interval '30 days'),
      'last_90d', (SELECT COUNT(*) FROM profiles WHERE created_at > now() - interval '90 days')
    ),
    'engagement', jsonb_build_object(
      'with_style_profile', (SELECT COUNT(*) FROM style_profiles),
      'with_saved_outfits', (SELECT COUNT(DISTINCT user_id) FROM user_saved_outfits),
      'with_quiz_completed', (SELECT COUNT(*) FROM style_profiles WHERE completed_at IS NOT NULL)
    ),
    'referrals', jsonb_build_object(
      'users_with_referrals', (SELECT COUNT(*) FROM profiles WHERE referral_count > 0),
      'total_referrals', (SELECT COALESCE(SUM(referral_count), 0) FROM profiles)
    )
  ) INTO v_metrics;
  
  RETURN v_metrics;
END;
$$;

-- Set user admin status
CREATE OR REPLACE FUNCTION set_user_admin(
  p_target_user_id uuid,
  p_is_admin boolean,
  p_reason text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check admin permission
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true) THEN
    RAISE EXCEPTION 'Unauthorized: admin access required';
  END IF;

  -- Update user
  UPDATE profiles SET is_admin = p_is_admin WHERE id = p_target_user_id;

  -- Log action
  INSERT INTO admin_audit_log (admin_id, action, target_user_id, details)
  VALUES (
    auth.uid(),
    CASE WHEN p_is_admin THEN 'grant_admin' ELSE 'revoke_admin' END,
    p_target_user_id,
    jsonb_build_object('reason', p_reason, 'is_admin', p_is_admin)
  );

  RETURN true;
END;
$$;

-- Set user tier
CREATE OR REPLACE FUNCTION set_user_tier(
  p_target_user_id uuid,
  p_tier text,
  p_reason text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_old_tier text;
BEGIN
  -- Check admin permission
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true) THEN
    RAISE EXCEPTION 'Unauthorized: admin access required';
  END IF;

  -- Get old tier
  SELECT tier INTO v_old_tier FROM profiles WHERE id = p_target_user_id;

  -- Update tier
  UPDATE profiles SET tier = p_tier WHERE id = p_target_user_id;

  -- Log action
  INSERT INTO admin_audit_log (admin_id, action, target_user_id, details)
  VALUES (
    auth.uid(),
    'tier_change',
    p_target_user_id,
    jsonb_build_object('old_tier', v_old_tier, 'new_tier', p_tier, 'reason', p_reason)
  );

  RETURN true;
END;
$$;

-- Log admin action
CREATE OR REPLACE FUNCTION log_admin_action(
  p_action text,
  p_target_user_id uuid DEFAULT NULL,
  p_details jsonb DEFAULT '{}'::jsonb,
  p_ip_address text DEFAULT NULL,
  p_user_agent text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_log_id uuid;
BEGIN
  INSERT INTO admin_audit_log (
    admin_id,
    action,
    target_user_id,
    details,
    ip_address,
    user_agent
  ) VALUES (
    auth.uid(),
    p_action,
    p_target_user_id,
    p_details,
    p_ip_address,
    p_user_agent
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;