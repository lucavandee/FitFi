/*
  # Rate Limiting System

  1. New Tables
    - `rate_limits`
      - Tracks request counts per identifier (IP or user_id)
      - Auto-cleanup old records
      - Supports different limit types (endpoint-specific)

    - `security_events`
      - Comprehensive audit log for security events
      - Failed logins, rate limit hits, suspicious activity
      - Retention: 1 year

  2. Security
    - RLS enabled on both tables
    - Admin-only access to security_events
    - Automatic cleanup of old rate_limit records

  3. Functions
    - `check_rate_limit()` - Checks if request is within limits
    - `log_security_event()` - Logs security-relevant events
    - `cleanup_old_rate_limits()` - Auto-cleanup via cron
*/

-- =====================================================
-- RATE LIMITING TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL,
  identifier_type text NOT NULL CHECK (identifier_type IN ('ip', 'user', 'combined')),
  endpoint text NOT NULL,
  request_count integer NOT NULL DEFAULT 1,
  window_start timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_lookup ON rate_limits(identifier, endpoint, window_start DESC);
CREATE INDEX IF NOT EXISTS idx_rate_limits_cleanup ON rate_limits(window_start);

ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view rate limits" ON rate_limits FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

-- =====================================================
-- SECURITY EVENTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS security_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address text,
  user_agent text,
  endpoint text,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_user ON security_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity, created_at DESC);

ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view security events" ON security_events FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

CREATE POLICY "System can insert security events" ON security_events FOR INSERT WITH CHECK (true);

-- =====================================================
-- RATE LIMITING FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION check_rate_limit(
  p_identifier text,
  p_identifier_type text,
  p_endpoint text,
  p_max_requests integer,
  p_window_minutes integer DEFAULT 1
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_window_start timestamptz;
  v_current_count integer;
  v_is_allowed boolean;
  v_remaining integer;
  v_reset_at timestamptz;
BEGIN
  v_window_start := date_trunc('minute', now()) - (EXTRACT(minute FROM now())::integer % p_window_minutes) * interval '1 minute';

  SELECT request_count INTO v_current_count FROM rate_limits
  WHERE identifier = p_identifier AND endpoint = p_endpoint AND window_start = v_window_start FOR UPDATE;

  IF v_current_count IS NULL THEN
    INSERT INTO rate_limits (identifier, identifier_type, endpoint, window_start, request_count)
    VALUES (p_identifier, p_identifier_type, p_endpoint, v_window_start, 1) RETURNING request_count INTO v_current_count;
  END IF;

  v_is_allowed := v_current_count <= p_max_requests;
  v_remaining := GREATEST(0, p_max_requests - v_current_count);
  v_reset_at := v_window_start + (p_window_minutes * interval '1 minute');

  IF v_is_allowed THEN
    UPDATE rate_limits SET request_count = request_count + 1, updated_at = now()
    WHERE identifier = p_identifier AND endpoint = p_endpoint AND window_start = v_window_start;
  ELSE
    INSERT INTO security_events (event_type, severity, ip_address, endpoint, details)
    VALUES ('rate_limit_exceeded', 'medium', p_identifier, p_endpoint,
      jsonb_build_object('current_count', v_current_count, 'max_requests', p_max_requests, 'window_minutes', p_window_minutes));
  END IF;

  RETURN jsonb_build_object('allowed', v_is_allowed, 'remaining', v_remaining, 'reset_at', v_reset_at, 'current_count', v_current_count, 'limit', p_max_requests);
END;
$$;

-- =====================================================
-- SECURITY EVENT LOGGING
-- =====================================================

CREATE OR REPLACE FUNCTION log_security_event(
  p_event_type text, p_severity text, p_user_id uuid DEFAULT NULL, p_ip_address text DEFAULT NULL,
  p_user_agent text DEFAULT NULL, p_endpoint text DEFAULT NULL, p_details jsonb DEFAULT NULL
)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_event_id uuid;
BEGIN
  INSERT INTO security_events (event_type, severity, user_id, ip_address, user_agent, endpoint, details)
  VALUES (p_event_type, p_severity, p_user_id, p_ip_address, p_user_agent, p_endpoint, p_details)
  RETURNING id INTO v_event_id;
  RETURN v_event_id;
END;
$$;

-- =====================================================
-- CLEANUP FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_deleted_count integer;
BEGIN
  DELETE FROM rate_limits WHERE window_start < now() - interval '1 hour';
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RETURN v_deleted_count;
END;
$$;