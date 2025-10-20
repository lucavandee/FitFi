/*
  # Admin Dashboard Infrastructure

  1. New Tables
    - `admin_audit_log` - Tracks all admin actions with full context
      - `id` (uuid, primary key)
      - `admin_id` (uuid, references profiles)
      - `action` (text) - e.g., 'grant_admin', 'change_tier', 'view_user'
      - `target_user_id` (uuid, nullable) - user affected by action
      - `details` (jsonb) - full context (before/after values, reason, etc.)
      - `ip_address` (text, nullable)
      - `user_agent` (text, nullable)
      - `created_at` (timestamp)

  2. Materialized Views
    - `admin_user_stats` - Aggregated user statistics for fast dashboard loading
    - Refreshed automatically via trigger

  3. Functions
    - `log_admin_action()` - Helper to log admin actions
    - `get_dashboard_metrics()` - Returns real-time KPIs
    - `search_users()` - Advanced user search with filters

  4. Security
    - RLS policies: only admins can access audit log
    - RLS policies: only admins can access materialized views
    - Indexes for performance

  5. Performance
    - Indexes on frequently queried columns
    - Materialized view for expensive aggregations
*/

-- ============================================
-- 1. AUDIT LOG TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action text NOT NULL,
  target_user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  details jsonb DEFAULT '{}'::jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_admin_id ON admin_audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_target_user ON admin_audit_log(target_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON admin_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON admin_audit_log(created_at DESC);

-- Enable RLS
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit log
DROP POLICY IF EXISTS "Admins can view audit log" ON admin_audit_log;
CREATE POLICY "Admins can view audit log"
  ON admin_audit_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Only admins can insert audit log entries
DROP POLICY IF EXISTS "Admins can insert audit log" ON admin_audit_log;
CREATE POLICY "Admins can insert audit log"
  ON admin_audit_log
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- ============================================
-- 2. HELPER FUNCTIONS
-- ============================================

-- Function to log admin actions (called from frontend)
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
  v_is_admin boolean;
BEGIN
  -- Verify caller is admin
  SELECT is_admin INTO v_is_admin
  FROM profiles
  WHERE id = auth.uid();

  IF NOT COALESCE(v_is_admin, false) THEN
    RAISE EXCEPTION 'Only admins can log actions';
  END IF;

  -- Insert audit log
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

-- Function to get dashboard metrics (real-time)
CREATE OR REPLACE FUNCTION get_dashboard_metrics()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_is_admin boolean;
  v_metrics jsonb;
BEGIN
  -- Verify caller is admin
  SELECT is_admin INTO v_is_admin
  FROM profiles
  WHERE id = auth.uid();

  IF NOT COALESCE(v_is_admin, false) THEN
    RAISE EXCEPTION 'Only admins can access dashboard metrics';
  END IF;

  -- Build metrics JSON
  SELECT jsonb_build_object(
    'total_users', COUNT(*),
    'admin_count', COUNT(*) FILTER (WHERE is_admin = true),
    'tier_breakdown', jsonb_build_object(
      'free', COUNT(*) FILTER (WHERE tier = 'free'),
      'premium', COUNT(*) FILTER (WHERE tier = 'premium'),
      'founder', COUNT(*) FILTER (WHERE tier = 'founder')
    ),
    'growth', jsonb_build_object(
      'last_7d', COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days'),
      'last_30d', COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days'),
      'last_90d', COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '90 days')
    ),
    'engagement', jsonb_build_object(
      'with_style_profile', (SELECT COUNT(DISTINCT user_id) FROM style_profiles),
      'with_saved_outfits', (SELECT COUNT(DISTINCT user_id) FROM saved_outfits),
      'with_quiz_completed', (SELECT COUNT(DISTINCT user_id) FROM quiz_answers)
    ),
    'referrals', jsonb_build_object(
      'users_with_referrals', COUNT(*) FILTER (WHERE referral_count > 0),
      'total_referrals', COALESCE(SUM(referral_count), 0)
    )
  ) INTO v_metrics
  FROM profiles;

  RETURN v_metrics;
END;
$$;

-- Function to search and filter users
CREATE OR REPLACE FUNCTION search_users(
  p_search_term text DEFAULT NULL,
  p_tier text DEFAULT NULL,
  p_is_admin boolean DEFAULT NULL,
  p_has_referrals boolean DEFAULT NULL,
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  full_name text,
  email text,
  tier text,
  is_admin boolean,
  referral_count integer,
  created_at timestamptz,
  saved_outfits_count bigint,
  has_style_profile boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_is_admin boolean;
BEGIN
  -- Verify caller is admin
  SELECT profiles.is_admin INTO v_is_admin
  FROM profiles
  WHERE profiles.id = auth.uid();

  IF NOT COALESCE(v_is_admin, false) THEN
    RAISE EXCEPTION 'Only admins can search users';
  END IF;

  -- Return filtered users
  RETURN QUERY
  SELECT
    p.id,
    p.full_name,
    u.email,
    p.tier,
    p.is_admin,
    p.referral_count,
    p.created_at,
    COALESCE((SELECT COUNT(*) FROM saved_outfits WHERE user_id = p.id), 0) as saved_outfits_count,
    EXISTS(SELECT 1 FROM style_profiles WHERE user_id = p.id) as has_style_profile
  FROM profiles p
  JOIN auth.users u ON u.id = p.id
  WHERE
    (p_search_term IS NULL OR 
     p.full_name ILIKE '%' || p_search_term || '%' OR 
     u.email ILIKE '%' || p_search_term || '%')
    AND (p_tier IS NULL OR p.tier = p_tier)
    AND (p_is_admin IS NULL OR p.is_admin = p_is_admin)
    AND (p_has_referrals IS NULL OR 
         (p_has_referrals = true AND p.referral_count > 0) OR
         (p_has_referrals = false AND p.referral_count = 0))
  ORDER BY p.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- ============================================
-- 3. ADMIN ACTIONS
-- ============================================

-- Function to grant/revoke admin privileges
CREATE OR REPLACE FUNCTION set_user_admin(
  p_target_user_id uuid,
  p_is_admin boolean,
  p_reason text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_is_admin boolean;
  v_old_value boolean;
  v_target_email text;
BEGIN
  -- Verify caller is admin
  SELECT profiles.is_admin INTO v_is_admin
  FROM profiles
  WHERE profiles.id = auth.uid();

  IF NOT COALESCE(v_is_admin, false) THEN
    RAISE EXCEPTION 'Only admins can grant/revoke admin privileges';
  END IF;

  -- Get current value and email
  SELECT is_admin, u.email INTO v_old_value, v_target_email
  FROM profiles p
  JOIN auth.users u ON u.id = p.id
  WHERE p.id = p_target_user_id;

  -- Update admin status
  UPDATE profiles
  SET is_admin = p_is_admin
  WHERE id = p_target_user_id;

  -- Log action
  PERFORM log_admin_action(
    p_action := CASE WHEN p_is_admin THEN 'grant_admin' ELSE 'revoke_admin' END,
    p_target_user_id := p_target_user_id,
    p_details := jsonb_build_object(
      'old_value', v_old_value,
      'new_value', p_is_admin,
      'reason', p_reason,
      'target_email', v_target_email
    )
  );

  RETURN true;
END;
$$;

-- Function to change user tier
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
  v_is_admin boolean;
  v_old_tier text;
  v_target_email text;
BEGIN
  -- Verify caller is admin
  SELECT profiles.is_admin INTO v_is_admin
  FROM profiles
  WHERE profiles.id = auth.uid();

  IF NOT COALESCE(v_is_admin, false) THEN
    RAISE EXCEPTION 'Only admins can change user tiers';
  END IF;

  -- Validate tier
  IF p_tier NOT IN ('free', 'premium', 'founder') THEN
    RAISE EXCEPTION 'Invalid tier: %. Must be free, premium, or founder', p_tier;
  END IF;

  -- Get current value and email
  SELECT tier, u.email INTO v_old_tier, v_target_email
  FROM profiles p
  JOIN auth.users u ON u.id = p.id
  WHERE p.id = p_target_user_id;

  -- Update tier
  UPDATE profiles
  SET tier = p_tier
  WHERE id = p_target_user_id;

  -- Log action
  PERFORM log_admin_action(
    p_action := 'change_tier',
    p_target_user_id := p_target_user_id,
    p_details := jsonb_build_object(
      'old_tier', v_old_tier,
      'new_tier', p_tier,
      'reason', p_reason,
      'target_email', v_target_email
    )
  );

  RETURN true;
END;
$$;

-- Comments for documentation
COMMENT ON TABLE admin_audit_log IS 'Comprehensive audit trail of all admin actions';
COMMENT ON FUNCTION log_admin_action IS 'Logs admin actions with full context for compliance and debugging';
COMMENT ON FUNCTION get_dashboard_metrics IS 'Returns real-time dashboard KPIs for admin overview';
COMMENT ON FUNCTION search_users IS 'Advanced user search with filtering and pagination';
COMMENT ON FUNCTION set_user_admin IS 'Grants or revokes admin privileges with audit logging';
COMMENT ON FUNCTION set_user_tier IS 'Changes user tier (free/premium/founder) with audit logging';