/*
  # Fix duplicate gamification tables and policies

  1. Checks
    - Check if tables and policies already exist before creating them
  2. Tables
    - `user_gamification` with proper fields and constraints
    - `daily_challenges` with proper fields and constraints
  3. Security
    - Enable RLS on both tables
    - Add policies for users to read, update, and insert their own data
*/

-- Check if user_gamification table exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_gamification') THEN
    -- User gamification table
    CREATE TABLE IF NOT EXISTS user_gamification (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid REFERENCES users(id) ON DELETE CASCADE,
      points integer DEFAULT 0,
      level text DEFAULT 'beginner',
      badges text[] DEFAULT '{}',
      streak integer DEFAULT 0,
      last_check_in timestamptz,
      completed_challenges text[] DEFAULT '{}',
      total_referrals integer DEFAULT 0,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now(),
      UNIQUE(user_id)
    );

    ALTER TABLE user_gamification ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Check if policies exist before creating them
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'user_gamification' AND policyname = 'Users can read own gamification data'
  ) THEN
    -- Policy for users to read their own gamification data
    CREATE POLICY "Users can read own gamification data"
      ON user_gamification
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'user_gamification' AND policyname = 'Users can update own gamification data'
  ) THEN
    -- Policy for users to update their own gamification data
    CREATE POLICY "Users can update own gamification data"
      ON user_gamification
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'user_gamification' AND policyname = 'Users can insert own gamification data'
  ) THEN
    -- Policy for users to insert their own gamification data
    CREATE POLICY "Users can insert own gamification data"
      ON user_gamification
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Check if daily_challenges table exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'daily_challenges') THEN
    -- Daily challenges table
    CREATE TABLE IF NOT EXISTS daily_challenges (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid REFERENCES users(id) ON DELETE CASCADE,
      challenge_id text NOT NULL,
      completed boolean DEFAULT false,
      created_at timestamptz DEFAULT now(),
      UNIQUE(user_id, challenge_id)
    );

    ALTER TABLE daily_challenges ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Check if policies exist before creating them
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'daily_challenges' AND policyname = 'Users can read own daily challenges'
  ) THEN
    -- Policy for users to read their own daily challenges
    CREATE POLICY "Users can read own daily challenges"
      ON daily_challenges
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'daily_challenges' AND policyname = 'Users can update own daily challenges'
  ) THEN
    -- Policy for users to update their own daily challenges
    CREATE POLICY "Users can update own daily challenges"
      ON daily_challenges
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'daily_challenges' AND policyname = 'Users can insert own daily challenges'
  ) THEN
    -- Policy for users to insert their own daily challenges
    CREATE POLICY "Users can insert own daily challenges"
      ON daily_challenges
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;