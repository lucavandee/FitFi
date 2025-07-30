/*
  # Dashboard v1 + Founders Club Migration

  1. New Tables
    - Enhanced `profiles` table with avatar and referral tracking
    - `referrals` table for tracking referral relationships
    - `user_stats` table for dashboard metrics

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for public leaderboard access

  3. Functions
    - `get_referral_stats` RPC for dashboard data
    - `get_referral_leaderboard` RPC for top referrers
    - Auto-profile creation trigger
*/

-- Enhanced profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  username text UNIQUE,
  referral_code text UNIQUE,
  referral_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  referred_by uuid REFERENCES auth.users(id)
);

-- Referrals tracking table
CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code text NOT NULL UNIQUE,
  referred_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User stats for dashboard
CREATE TABLE IF NOT EXISTS user_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_completed boolean DEFAULT false,
  outfits_viewed integer DEFAULT 0,
  last_active timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT TO public
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT TO public
  USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE TO public
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Public leaderboard access
CREATE POLICY "profiles_read_leaderboard" ON profiles
  FOR SELECT TO public
  USING (true);

-- Referrals policies
CREATE POLICY "referrals_insert_own" ON referrals
  FOR INSERT TO public
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "referrals_select_own" ON referrals
  FOR SELECT TO public
  USING (auth.uid() = user_id);

CREATE POLICY "referrals_update_own" ON referrals
  FOR UPDATE TO public
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- User stats policies
CREATE POLICY "user_stats_insert_own" ON user_stats
  FOR INSERT TO public
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_stats_select_own" ON user_stats
  FOR SELECT TO public
  USING (auth.uid() = user_id);

CREATE POLICY "user_stats_update_own" ON user_stats
  FOR UPDATE TO public
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_profiles_referral_count ON profiles(referral_count);
CREATE INDEX IF NOT EXISTS idx_profiles_referred_by ON profiles(referred_by);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(code);
CREATE INDEX IF NOT EXISTS idx_referrals_user_id ON referrals(user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_user_id ON referrals(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_user_id_status ON referrals(user_id, status);
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_stats(user_id);

-- RPC function to get referral stats
CREATE OR REPLACE FUNCTION get_referral_stats(uid uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_referrals integer;
  user_rank integer;
  result json;
BEGIN
  -- Get total referrals for user
  SELECT COALESCE(referral_count, 0) INTO total_referrals
  FROM profiles
  WHERE id = uid;

  -- Get user rank (1-based)
  SELECT COUNT(*) + 1 INTO user_rank
  FROM profiles
  WHERE referral_count > total_referrals;

  -- Build result
  result := json_build_object(
    'total', COALESCE(total_referrals, 0),
    'rank', COALESCE(user_rank, 1),
    'is_founding_member', COALESCE(total_referrals, 0) >= 3
  );

  RETURN result;
END;
$$;

-- RPC function to get referral leaderboard
CREATE OR REPLACE FUNCTION get_referral_leaderboard()
RETURNS TABLE(
  user_id uuid,
  username text,
  referral_count integer,
  rank bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as user_id,
    COALESCE(p.username, 'Anonymous') as username,
    COALESCE(p.referral_count, 0) as referral_count,
    ROW_NUMBER() OVER (ORDER BY COALESCE(p.referral_count, 0) DESC) as rank
  FROM profiles p
  WHERE COALESCE(p.referral_count, 0) > 0
  ORDER BY COALESCE(p.referral_count, 0) DESC
  LIMIT 10;
END;
$$;

-- Function to create user referral code
CREATE OR REPLACE FUNCTION create_user_referral_code()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  new_code text;
  code_exists boolean;
BEGIN
  LOOP
    -- Generate random 6-character code
    new_code := upper(substring(md5(random()::text) from 1 for 6));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM profiles WHERE referral_code = new_code) INTO code_exists;
    
    -- Exit loop if code is unique
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN new_code;
END;
$$;

-- Trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO profiles (id, full_name, referral_code)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    create_user_referral_code()
  );
  
  INSERT INTO user_stats (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();