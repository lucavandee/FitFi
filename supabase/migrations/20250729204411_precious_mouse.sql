/*
  # FitFi Founders Club - Referral System

  1. New Tables
    - `referrals`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `code` (text, unique, 8-character referral code)
      - `referred_user_id` (uuid, foreign key to auth.users, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `status` (text, default 'pending')

  2. Security
    - Enable RLS on `referrals` table
    - Add policies for users to manage their own referrals
    - Add policy for reading leaderboard data

  3. Functions
    - `generate_referral_code()` - Generates unique 8-character codes
    - `get_referral_leaderboard()` - Returns top 10 referrers
*/

-- Create referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  code text UNIQUE NOT NULL,
  referred_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read own referrals"
  ON referrals
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own referrals"
  ON referrals
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own referrals"
  ON referrals
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Public policy for leaderboard (anonymized)
CREATE POLICY "Public can read leaderboard data"
  ON referrals
  FOR SELECT
  TO public
  USING (true);

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  code text;
  exists boolean;
BEGIN
  LOOP
    -- Generate 8-character alphanumeric code
    code := upper(substring(md5(random()::text) from 1 for 8));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM referrals WHERE referrals.code = code) INTO exists;
    
    -- Exit loop if code is unique
    IF NOT exists THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN code;
END;
$$;

-- Function to get referral leaderboard
CREATE OR REPLACE FUNCTION get_referral_leaderboard()
RETURNS TABLE (
  user_id uuid,
  referral_count bigint,
  rank bigint
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    r.user_id,
    COUNT(r.referred_user_id) as referral_count,
    ROW_NUMBER() OVER (ORDER BY COUNT(r.referred_user_id) DESC) as rank
  FROM referrals r
  WHERE r.referred_user_id IS NOT NULL
  GROUP BY r.user_id
  ORDER BY referral_count DESC
  LIMIT 10;
$$;

-- Function to create referral code for new users
CREATE OR REPLACE FUNCTION create_user_referral_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO referrals (user_id, code)
  VALUES (NEW.id, generate_referral_code());
  
  RETURN NEW;
END;
$$;

-- Trigger to auto-create referral code on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_referral_code();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_referrals_user_id ON referrals(user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(code);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_user_id ON referrals(referred_user_id);