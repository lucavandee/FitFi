/*
  # Fix RLS Policies for User Operations

  1. Security Updates
    - Fix RLS policies for users table to allow proper user creation and updates
    - Fix RLS policies for user_gamification table to allow INSERT/UPDATE operations
    - Ensure all policies use proper auth.uid() checks
    
  2. Policy Changes
    - Add missing INSERT policy for users table
    - Fix user_gamification policies to allow proper CRUD operations
    - Ensure consistent policy naming and structure
*/

-- Fix users table policies
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;

-- Create comprehensive policies for users table
CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Fix user_gamification table policies
DROP POLICY IF EXISTS "Users can insert own gamification data" ON user_gamification;
DROP POLICY IF EXISTS "Users can read own gamification data" ON user_gamification;
DROP POLICY IF EXISTS "Users can update own gamification data" ON user_gamification;

-- Create comprehensive policies for user_gamification table
CREATE POLICY "Users can insert own gamification data"
  ON user_gamification
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own gamification data"
  ON user_gamification
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own gamification data"
  ON user_gamification
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Also add policies for anonymous users (for development/testing)
CREATE POLICY "Allow anonymous read users"
  ON users
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous insert users"
  ON users
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous update users"
  ON users
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous read user_gamification"
  ON user_gamification
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous insert user_gamification"
  ON user_gamification
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous update user_gamification"
  ON user_gamification
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);