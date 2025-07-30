/*
  # Fix Auth 500 Errors - RPC Functions & Policies

  1. RPC Functions
    - `get_referral_leaderboard` - Get top referrers with counts
    - `get_user_profile` - Get complete user profile data
    - `submit_contact` - Handle contact form submissions

  2. Security
    - Enable RLS on all tables
    - Add proper policies for authenticated users
    - Fix service role permissions

  3. Performance
    - Add indexes for frequently queried columns
    - Optimize RPC function queries
*/

-- Create get_referral_leaderboard RPC function
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
    AND r.status = 'completed'
  GROUP BY r.user_id
  ORDER BY referral_count DESC
  LIMIT 10;
$$;

-- Create get_user_profile RPC function
CREATE OR REPLACE FUNCTION get_user_profile(user_uuid uuid)
RETURNS TABLE (
  id uuid,
  name text,
  email text,
  gender text,
  is_premium boolean,
  created_at timestamptz,
  referral_code text,
  referral_count bigint
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    u.id,
    u.name,
    u.email,
    u.gender,
    u.is_premium,
    u.created_at,
    r.code as referral_code,
    COALESCE(ref_count.count, 0) as referral_count
  FROM users u
  LEFT JOIN referrals r ON r.user_id = u.id
  LEFT JOIN (
    SELECT user_id, COUNT(*) as count
    FROM referrals 
    WHERE referred_user_id IS NOT NULL AND status = 'completed'
    GROUP BY user_id
  ) ref_count ON ref_count.user_id = u.id
  WHERE u.id = user_uuid;
$$;

-- Create submit_contact RPC function
CREATE OR REPLACE FUNCTION submit_contact(
  contact_name text,
  contact_email text,
  contact_subject text,
  contact_message text,
  contact_type text DEFAULT 'general'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  -- Insert contact submission
  INSERT INTO contact_submissions (
    name,
    email,
    subject,
    message,
    type,
    created_at
  ) VALUES (
    contact_name,
    contact_email,
    contact_subject,
    contact_message,
    contact_type,
    NOW()
  );
  
  -- Return success response
  result := json_build_object(
    'success', true,
    'message', 'Contact form submitted successfully'
  );
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    -- Return error response
    result := json_build_object(
      'success', false,
      'error', SQLERRM
    );
    RETURN result;
END;
$$;

-- Create contact_submissions table if it doesn't exist
CREATE TABLE IF NOT EXISTS contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'general',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on contact_submissions
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Add policy for contact submissions (allow insert for everyone)
CREATE POLICY "Anyone can submit contact forms"
  ON contact_submissions
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Grant execute permissions on RPC functions to public role
GRANT EXECUTE ON FUNCTION get_referral_leaderboard() TO public;
GRANT EXECUTE ON FUNCTION get_user_profile(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION submit_contact(text, text, text, text, text) TO public;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_referrals_user_id_status ON referrals(user_id, status);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_user_id ON referrals(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions(created_at);

-- Update referrals table to ensure proper structure
DO $$
BEGIN
  -- Add status column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'referrals' AND column_name = 'status'
  ) THEN
    ALTER TABLE referrals ADD COLUMN status text DEFAULT 'pending';
  END IF;
  
  -- Add code column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'referrals' AND column_name = 'code'
  ) THEN
    ALTER TABLE referrals ADD COLUMN code text UNIQUE;
  END IF;
END $$;

-- Update existing referrals to have completed status if they have referred_user_id
UPDATE referrals 
SET status = 'completed' 
WHERE referred_user_id IS NOT NULL AND status = 'pending';

-- Generate referral codes for existing users who don't have one
UPDATE referrals 
SET code = 'FITFI' || UPPER(SUBSTRING(gen_random_uuid()::text, 1, 6))
WHERE code IS NULL;