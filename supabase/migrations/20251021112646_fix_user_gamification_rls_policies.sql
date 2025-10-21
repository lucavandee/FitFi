/*
  # Fix user_gamification RLS Policies

  1. Problem
    - Multiple conflicting policies on user_gamification table
    - "Allow all operations" policy conflicts with specific policies
    - Causes 406 Not Acceptable errors in PostgREST

  2. Solution
    - Drop all existing policies
    - Create clean, specific policies for each operation
    - Ensure policies are non-conflicting

  3. Security
    - Users can only access their own gamification data
    - Authenticated users required for all operations
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "Allow all operations on user_gamification" ON user_gamification;
DROP POLICY IF EXISTS "user_gamification_insert_own" ON user_gamification;
DROP POLICY IF EXISTS "user_gamification_read_own" ON user_gamification;
DROP POLICY IF EXISTS "user_gamification_update_own" ON user_gamification;
DROP POLICY IF EXISTS "user_gamification_write_own" ON user_gamification;

-- Create clean, non-conflicting policies
CREATE POLICY "Users can read own gamification data"
  ON user_gamification
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own gamification data"
  ON user_gamification
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own gamification data"
  ON user_gamification
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own gamification data"
  ON user_gamification
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
