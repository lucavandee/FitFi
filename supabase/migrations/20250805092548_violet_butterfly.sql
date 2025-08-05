/*
  # Create RLS policy for achievements table

  1. Security
    - Enable RLS on quiz_achievements table (if not already enabled)
    - Add policy for users to read their own achievements
    - Add policy for users to insert their own achievements
*/

-- Enable RLS on quiz_achievements table if not already enabled
ALTER TABLE quiz_achievements ENABLE ROW LEVEL SECURITY;

-- Create policy for users to select their own achievements
CREATE POLICY "Users can read own achievements"
  ON quiz_achievements
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policy for users to insert their own achievements  
CREATE POLICY "Users can insert own achievements"
  ON quiz_achievements
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own achievements
CREATE POLICY "Users can update own achievements"
  ON quiz_achievements
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);