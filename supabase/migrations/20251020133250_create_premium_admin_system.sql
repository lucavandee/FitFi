/*
  # Premium Admin System - Complete Infrastructure

  1. New Tables
    - `admin_notifications` - Send messages to users
    - `admin_user_sessions` - Track impersonation sessions
    
  2. Functions
    - send_admin_notification() - Send notification with audit logging
    - upgrade_user_tier() - Change user tier with audit logging
    - get_admin_metrics() - Real-time dashboard metrics
    - export_users_csv() - Export user data
    
  3. Security
    - All tables have RLS enabled
    - Only admins (profiles.is_admin = true) can access admin features
    - All admin actions are logged to admin_audit_log
    
  4. Indexes
    - Performance indexes on all foreign keys and filters
*/

-- ============================================
-- NOTIFICATIONS SYSTEM
-- ============================================

CREATE TABLE IF NOT EXISTS admin_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  target_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  target_tier text,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info',
  action_url text,
  action_label text,
  is_read boolean DEFAULT false,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_target_user ON admin_notifications(target_user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_target_tier ON admin_notifications(target_tier);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON admin_notifications(created_at DESC);

ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their notifications"
  ON admin_notifications FOR SELECT TO authenticated
  USING (
    target_user_id = auth.uid()
    OR target_user_id IS NULL
    OR (target_tier IS NOT NULL AND EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.tier = admin_notifications.target_tier
    ))
  );

CREATE POLICY "Users can update their notifications"
  ON admin_notifications FOR UPDATE TO authenticated
  USING (target_user_id = auth.uid())
  WITH CHECK (target_user_id = auth.uid());

CREATE POLICY "Admins can manage notifications"
  ON admin_notifications FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

-- ============================================
-- IMPERSONATION SESSIONS
-- ============================================

CREATE TABLE IF NOT EXISTS admin_user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  ip_address text,
  user_agent text
);

CREATE INDEX IF NOT EXISTS idx_sessions_admin ON admin_user_sessions(admin_id);
CREATE INDEX IF NOT EXISTS idx_sessions_target ON admin_user_sessions(target_user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_active ON admin_user_sessions(ended_at) WHERE ended_at IS NULL;

ALTER TABLE admin_user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage sessions"
  ON admin_user_sessions FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

-- ============================================
-- ADMIN FUNCTIONS
-- ============================================

-- Send notification with audit logging
CREATE OR REPLACE FUNCTION send_admin_notification(
  p_target_user_id uuid,
  p_target_tier text,
  p_title text,
  p_message text,
  p_type text DEFAULT 'info',
  p_action_url text DEFAULT NULL,
  p_action_label text DEFAULT NULL,
  p_expires_at timestamptz DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_notification_id uuid;
BEGIN
  -- Check admin permission
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true) THEN
    RAISE EXCEPTION 'Unauthorized: admin access required';
  END IF;

  INSERT INTO admin_notifications (
    created_by, target_user_id, target_tier, title, message, type,
    action_url, action_label, expires_at
  ) VALUES (
    auth.uid(), p_target_user_id, p_target_tier, p_title, p_message, p_type,
    p_action_url, p_action_label, p_expires_at
  ) RETURNING id INTO v_notification_id;
  
  -- Log action
  INSERT INTO admin_audit_log (admin_id, action, target_user_id, details)
  VALUES (auth.uid(), 'notification_sent', p_target_user_id, jsonb_build_object(
    'notification_id', v_notification_id,
    'title', p_title,
    'target_tier', p_target_tier
  ));
  
  RETURN v_notification_id;
END;
$$;

-- Upgrade user tier with audit logging
CREATE OR REPLACE FUNCTION upgrade_user_tier(
  p_user_id uuid,
  p_new_tier text,
  p_reason text DEFAULT NULL
)
RETURNS void
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
  SELECT tier INTO v_old_tier FROM profiles WHERE id = p_user_id;
  
  -- Update tier
  UPDATE profiles SET tier = p_new_tier WHERE id = p_user_id;
  
  -- Log action
  INSERT INTO admin_audit_log (admin_id, action, target_user_id, details)
  VALUES (auth.uid(), 'tier_upgrade', p_user_id, jsonb_build_object(
    'old_tier', v_old_tier,
    'new_tier', p_new_tier,
    'reason', p_reason
  ));
END;
$$;

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