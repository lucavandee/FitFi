/*
  # Supabase Errors Logging Table

  1. New Tables
    - `supabase_errors` - Centralized error logging for all Supabase operations

  2. Security
    - Enable RLS on supabase_errors table
    - Users can only insert their own errors
    - Admins can read all errors for debugging

  3. Features
    - Automatic error logging with context
    - User session tracking
    - Error categorization and severity levels
*/

-- Supabase errors table for centralized error logging
CREATE TABLE IF NOT EXISTS supabase_errors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id text,
  operation_type text NOT NULL, -- 'select', 'insert', 'update', 'delete', 'rpc'
  table_name text,
  function_name text,
  error_code text,
  error_message text NOT NULL,
  error_details jsonb DEFAULT '{}',
  request_path text,
  user_agent text,
  ip_address inet,
  retry_count integer DEFAULT 0,
  severity text DEFAULT 'error' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  resolved boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes for performance and querying
CREATE INDEX IF NOT EXISTS idx_supabase_errors_user_id ON supabase_errors(user_id);
CREATE INDEX IF NOT EXISTS idx_supabase_errors_created_at ON supabase_errors(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_supabase_errors_error_code ON supabase_errors(error_code);
CREATE INDEX IF NOT EXISTS idx_supabase_errors_severity ON supabase_errors(severity);
CREATE INDEX IF NOT EXISTS idx_supabase_errors_table_name ON supabase_errors(table_name);
CREATE INDEX IF NOT EXISTS idx_supabase_errors_resolved ON supabase_errors(resolved);

-- Enable RLS
ALTER TABLE supabase_errors ENABLE ROW LEVEL SECURITY;

-- RLS Policies for supabase_errors
CREATE POLICY "Users can insert own errors"
  ON supabase_errors
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can read own errors"
  ON supabase_errors
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all errors"
  ON supabase_errors
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
  );

-- Function to log errors with automatic context
CREATE OR REPLACE FUNCTION log_supabase_error(
  error_code_param text,
  error_message_param text,
  operation_type_param text DEFAULT 'unknown',
  table_name_param text DEFAULT NULL,
  function_name_param text DEFAULT NULL,
  error_details_param jsonb DEFAULT '{}',
  retry_count_param integer DEFAULT 0,
  severity_param text DEFAULT 'error'
)
RETURNS uuid
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  error_id uuid;
  current_user_id uuid;
BEGIN
  -- Get current user ID (may be null for anonymous operations)
  current_user_id := auth.uid();
  
  -- Insert error log
  INSERT INTO supabase_errors (
    user_id,
    session_id,
    operation_type,
    table_name,
    function_name,
    error_code,
    error_message,
    error_details,
    retry_count,
    severity,
    created_at
  ) VALUES (
    current_user_id,
    current_setting('request.jwt.claims', true)::json->>'session_id',
    operation_type_param,
    table_name_param,
    function_name_param,
    error_code_param,
    error_message_param,
    error_details_param,
    retry_count_param,
    severity_param,
    now()
  ) RETURNING id INTO error_id;
  
  RETURN error_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION log_supabase_error TO authenticated;
GRANT EXECUTE ON FUNCTION log_supabase_error TO anon;