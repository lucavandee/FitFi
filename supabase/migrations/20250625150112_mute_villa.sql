-- Fix RLS policies for all tables to ensure proper access

-- First, drop existing policies that might be causing issues
DO $$ 
BEGIN
  -- Drop policies for users table
  DROP POLICY IF EXISTS "Users can read own data" ON users;
  DROP POLICY IF EXISTS "Users can update own data" ON users;
  DROP POLICY IF EXISTS "Users can insert own data" ON users;
  DROP POLICY IF EXISTS "Allow anonymous read users" ON users;
  DROP POLICY IF EXISTS "Allow anonymous insert users" ON users;
  DROP POLICY IF EXISTS "Allow anonymous update users" ON users;
  
  -- Drop policies for user_gamification table
  DROP POLICY IF EXISTS "Users can read own gamification data" ON user_gamification;
  DROP POLICY IF EXISTS "Users can update own gamification data" ON user_gamification;
  DROP POLICY IF EXISTS "Users can insert own gamification data" ON user_gamification;
  DROP POLICY IF EXISTS "Allow anonymous read user_gamification" ON user_gamification;
  DROP POLICY IF EXISTS "Allow anonymous insert user_gamification" ON user_gamification;
  DROP POLICY IF EXISTS "Allow anonymous update user_gamification" ON user_gamification;
  
  -- Drop policies for daily_challenges table
  DROP POLICY IF EXISTS "Users can read own daily challenges" ON daily_challenges;
  DROP POLICY IF EXISTS "Users can update own daily challenges" ON daily_challenges;
  DROP POLICY IF EXISTS "Users can insert own daily challenges" ON daily_challenges;
END $$;

-- Create new policies for users table
CREATE POLICY "Allow all operations on users"
  ON users
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create new policies for user_gamification table
CREATE POLICY "Allow all operations on user_gamification"
  ON user_gamification
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create new policies for daily_challenges table
CREATE POLICY "Allow all operations on daily_challenges"
  ON daily_challenges
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create new policies for style_preferences table
CREATE POLICY "Allow all operations on style_preferences"
  ON style_preferences
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create new policies for quiz_answers table
CREATE POLICY "Allow all operations on quiz_answers"
  ON quiz_answers
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create new policies for saved_outfits table
CREATE POLICY "Allow all operations on saved_outfits"
  ON saved_outfits
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create new policies for outfits table
CREATE POLICY "Allow all operations on outfits"
  ON outfits
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create new policies for outfit_items table
CREATE POLICY "Allow all operations on outfit_items"
  ON outfit_items
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create new policies for products table
CREATE POLICY "Allow all operations on products"
  ON products
  FOR ALL
  USING (true)
  WITH CHECK (true);