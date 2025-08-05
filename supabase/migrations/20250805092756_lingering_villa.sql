/*
  # Create achievements RLS policy

  1. Security
    - Enable RLS on `quiz_achievements` table
    - Add policy for users to read their own achievements
    - Prevent 401/403 errors on achievements queries
*/

-- Enable RLS if not already enabled
ALTER TABLE quiz_achievements ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read their own achievements
CREATE POLICY "user_reads_own_achievements"
  ON quiz_achievements
  FOR SELECT
  USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT SELECT ON quiz_achievements TO authenticated;
GRANT SELECT ON quiz_achievements TO anon;