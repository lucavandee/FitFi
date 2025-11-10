/*
  # Create user activity log table for streak calendar

  1. New Tables
    - `user_activity_log`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `activity_date` (date, not null) - The date of activity (not timestamp for simplicity)
      - `activity_type` (text) - Type of activity (e.g., 'login', 'quiz_completed', 'outfit_saved')
      - `xp_earned` (integer, default 0) - XP earned from this activity
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS on `user_activity_log` table
    - Add policy for users to read their own activity log
    - Add policy for system to insert activity logs
  
  3. Indexes
    - Index on (user_id, activity_date) for fast calendar queries
    - Unique constraint on (user_id, activity_date, activity_type) to prevent duplicates
*/

-- Create user_activity_log table
CREATE TABLE IF NOT EXISTS user_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  activity_date date NOT NULL DEFAULT CURRENT_DATE,
  activity_type text NOT NULL,
  xp_earned integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_date 
  ON user_activity_log(user_id, activity_date DESC);

CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_type_date 
  ON user_activity_log(user_id, activity_type, activity_date DESC);

-- Unique constraint to prevent duplicate activities on same day
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_activity_log_unique_daily 
  ON user_activity_log(user_id, activity_date, activity_type);

-- Enable RLS
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own activity log
CREATE POLICY "Users can view own activity log"
  ON user_activity_log
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own activity (for client-side tracking)
CREATE POLICY "Users can log own activity"
  ON user_activity_log
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Helper function to get active dates for calendar view
CREATE OR REPLACE FUNCTION get_user_activity_dates(
  p_user_id uuid,
  p_start_date date,
  p_end_date date
)
RETURNS TABLE(activity_date date, activity_count bigint, total_xp integer)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ual.activity_date,
    COUNT(DISTINCT ual.activity_type)::bigint as activity_count,
    COALESCE(SUM(ual.xp_earned), 0)::integer as total_xp
  FROM user_activity_log ual
  WHERE ual.user_id = p_user_id
    AND ual.activity_date >= p_start_date
    AND ual.activity_date <= p_end_date
  GROUP BY ual.activity_date
  ORDER BY ual.activity_date DESC;
END;
$$;

-- Function to log daily check-in (upsert pattern)
CREATE OR REPLACE FUNCTION log_daily_checkin(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert daily check-in if not already logged today
  INSERT INTO user_activity_log (user_id, activity_date, activity_type, xp_earned)
  VALUES (p_user_id, CURRENT_DATE, 'daily_checkin', 10)
  ON CONFLICT (user_id, activity_date, activity_type) DO NOTHING;
  
  -- Update last_check_in in user_gamification
  UPDATE user_gamification
  SET last_check_in = now(),
      updated_at = now()
  WHERE user_id = p_user_id;
  
  RETURN true;
END;
$$;