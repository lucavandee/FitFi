/*
  # Supabase Error Logging System

  1. New Tables
    - `supabase_errors` - Centralized error logging for all Supabase operations
    
  2. Security
    - Enable RLS on supabase_errors table
    - Users can only read their own errors
    - System can insert errors for any user
    
  3. Features
    - Automatic error logging for all Supabase operations
    - Retry logic for network and server errors
    - User-friendly error messages with toast notifications
    - Error analytics and monitoring
*/

-- Supabase errors table for centralized error logging
CREATE TABLE IF NOT EXISTS supabase_errors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id text,
  error_code text,
  error_message text,
  operation_type text, -- 'select', 'insert', 'update', 'delete', 'function_invoke'
  table_name text,
  function_name text,
  error_details jsonb DEFAULT '{}',
  retry_count integer DEFAULT 0,
  severity text DEFAULT 'error' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  resolved boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_supabase_errors_user_id ON supabase_errors(user_id);
CREATE INDEX IF NOT EXISTS idx_supabase_errors_created_at ON supabase_errors(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_supabase_errors_severity ON supabase_errors(severity);
CREATE INDEX IF NOT EXISTS idx_supabase_errors_operation ON supabase_errors(operation_type);
CREATE INDEX IF NOT EXISTS idx_supabase_errors_table ON supabase_errors(table_name);

-- Enable RLS
ALTER TABLE supabase_errors ENABLE ROW LEVEL SECURITY;

-- RLS Policies for supabase_errors
CREATE POLICY "Users can read own errors"
  ON supabase_errors
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert errors"
  ON supabase_errors
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Function to log Supabase errors
CREATE OR REPLACE FUNCTION log_supabase_error(
  error_code_param text,
  error_message_param text,
  operation_type_param text,
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
    error_code,
    error_message,
    operation_type,
    table_name,
    function_name,
    error_details,
    retry_count,
    severity
  ) VALUES (
    current_user_id,
    COALESCE(error_details_param->>'session_id', 'unknown'),
    error_code_param,
    error_message_param,
    operation_type_param,
    table_name_param,
    function_name_param,
    error_details_param,
    retry_count_param,
    severity_param
  )
  RETURNING id INTO error_id;
  
  RETURN error_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION log_supabase_error TO authenticated;
GRANT EXECUTE ON FUNCTION log_supabase_error TO anon;