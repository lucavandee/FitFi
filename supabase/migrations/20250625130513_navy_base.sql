/*
  # Create gamification tables

  1. New Tables
    - `user_gamification`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `points` (integer)
      - `level` (text)
      - `badges` (text array)
      - `streak` (integer)
      - `last_check_in` (timestamp)
      - `completed_challenges` (text array)
      - `total_referrals` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `daily_challenges`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `challenge_id` (text)
      - `completed` (boolean)
      - `created_at` (timestamp)
  2. Security
    - Enable RLS on both tables
    - Add policies for users to read/update their own gamification data
*/

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

-- Policy for users to read their own gamification data
CREATE POLICY "Users can read own gamification data"
  ON user_gamification
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy for users to update their own gamification data
CREATE POLICY "Users can update own gamification data"
  ON user_gamification
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy for users to insert their own gamification data
CREATE POLICY "Users can insert own gamification data"
  ON user_gamification
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

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

-- Policy for users to read their own daily challenges
CREATE POLICY "Users can read own daily challenges"
  ON daily_challenges
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy for users to update their own daily challenges
CREATE POLICY "Users can update own daily challenges"
  ON daily_challenges
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy for users to insert their own daily challenges
CREATE POLICY "Users can insert own daily challenges"
  ON daily_challenges
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);