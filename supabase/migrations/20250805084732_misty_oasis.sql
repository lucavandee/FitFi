/*
  # Create achievements RLS policy

  1. Security
    - Enable RLS on quiz_achievements table (already enabled)
    - Add policy for users to read their own achievements
*/

-- Create policy for users to select their own achievements
CREATE POLICY IF NOT EXISTS "user selects own achievements"
  ON quiz_achievements
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Also allow public access for fallback scenarios
CREATE POLICY IF NOT EXISTS "public selects own achievements"
  ON quiz_achievements
  FOR SELECT
  TO public
  USING (auth.uid() = user_id);