/*
  # Nova Authentication & Rate Limiting

  ## Problem
  - Anyone can use Nova (even non-logged users)
  - Every request costs money (OpenAI API)
  - No tier-based limitations
  - Free users get unlimited access

  ## Solution
  1. Add user_tier to profiles (free/premium/founder)
  2. Create nova_usage table for tracking
  3. Implement rate limits per tier:
     - Free: 10 messages/day
     - Premium: 100 messages/day
     - Founder: Unlimited

  ## Changes
  - Add `tier` column to profiles
  - Create `nova_usage` table with daily tracking
  - Add RLS policies for security
*/

-- 1. Add tier to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS tier text DEFAULT 'free'
CHECK (tier IN ('free', 'premium', 'founder'));

COMMENT ON COLUMN profiles.tier IS 'User subscription tier. Default: free. Premium/founder get more Nova messages.';

-- 2. Create nova_usage tracking table
CREATE TABLE IF NOT EXISTS nova_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  message_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  -- Enforce one row per user per day
  UNIQUE(user_id, date)
);

COMMENT ON TABLE nova_usage IS 'Tracks Nova AI usage per user per day for rate limiting';

-- 3. Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_nova_usage_user_date ON nova_usage(user_id, date DESC);

-- 4. Enable RLS
ALTER TABLE nova_usage ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies

-- Users can read their own usage
CREATE POLICY "Users can view own Nova usage"
  ON nova_usage
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- System can insert/update (via service role or function)
CREATE POLICY "System can manage Nova usage"
  ON nova_usage
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 6. Function to increment usage
CREATE OR REPLACE FUNCTION increment_nova_usage(p_user_id uuid)
RETURNS TABLE (
  current_count integer,
  tier_limit integer,
  can_use boolean
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_tier text;
  v_count integer;
  v_limit integer;
BEGIN
  -- Get user tier
  SELECT profiles.tier INTO v_tier
  FROM profiles
  WHERE id = p_user_id;

  -- Default to free if no profile
  IF v_tier IS NULL THEN
    v_tier := 'free';
  END IF;

  -- Set limits based on tier
  v_limit := CASE
    WHEN v_tier = 'founder' THEN 999999  -- Unlimited
    WHEN v_tier = 'premium' THEN 100     -- 100/day
    ELSE 10                               -- 10/day for free
  END;

  -- Upsert usage count
  INSERT INTO nova_usage (user_id, date, message_count, updated_at)
  VALUES (p_user_id, CURRENT_DATE, 1, now())
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    message_count = nova_usage.message_count + 1,
    updated_at = now()
  RETURNING message_count INTO v_count;

  -- Return status
  RETURN QUERY SELECT
    v_count AS current_count,
    v_limit AS tier_limit,
    (v_count <= v_limit) AS can_use;
END;
$$;

COMMENT ON FUNCTION increment_nova_usage IS 'Increments Nova usage counter and checks rate limit. Returns current count, limit, and can_use boolean.';

-- 7. Function to check if user can use Nova
CREATE OR REPLACE FUNCTION can_use_nova(p_user_id uuid)
RETURNS TABLE (
  can_use boolean,
  current_count integer,
  tier_limit integer,
  tier text,
  reason text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_tier text;
  v_count integer;
  v_limit integer;
  v_has_profile boolean;
  v_quiz_completed boolean;
BEGIN
  -- Check if user has profile
  SELECT EXISTS(
    SELECT 1 FROM profiles WHERE id = p_user_id
  ) INTO v_has_profile;

  IF NOT v_has_profile THEN
    RETURN QUERY SELECT
      false AS can_use,
      0 AS current_count,
      0 AS tier_limit,
      'none'::text AS tier,
      'No profile found. Please sign up.'::text AS reason;
    RETURN;
  END IF;

  -- Get user tier
  SELECT profiles.tier INTO v_tier
  FROM profiles
  WHERE id = p_user_id;

  IF v_tier IS NULL THEN
    v_tier := 'free';
  END IF;

  -- Set limits
  v_limit := CASE
    WHEN v_tier = 'founder' THEN 999999
    WHEN v_tier = 'premium' THEN 100
    ELSE 10
  END;

  -- Get today's usage
  SELECT COALESCE(message_count, 0) INTO v_count
  FROM nova_usage
  WHERE user_id = p_user_id
    AND date = CURRENT_DATE;

  IF v_count IS NULL THEN
    v_count := 0;
  END IF;

  -- Check if quiz completed (RELAXED for development)
  -- Allow if profile exists, even without style_profiles entry
  -- This enables testing Nova without completing quiz
  SELECT EXISTS(
    SELECT 1 FROM style_profiles
    WHERE style_profiles.user_id = p_user_id
      AND completed_at IS NOT NULL
  ) INTO v_quiz_completed;

  -- TEMPORARY: Only warn about missing quiz, don't block
  -- Remove this bypass in production if you want to enforce quiz completion
  IF NOT v_quiz_completed THEN
    -- Log warning but allow access
    RAISE NOTICE 'User % has not completed quiz but access granted (dev mode)', p_user_id;
  END IF;

  -- Check rate limit
  IF v_count >= v_limit THEN
    RETURN QUERY SELECT
      false AS can_use,
      v_count AS current_count,
      v_limit AS tier_limit,
      v_tier AS tier,
      'Daily limit reached. Upgrade to premium for more messages.'::text AS reason;
    RETURN;
  END IF;

  -- All checks passed
  RETURN QUERY SELECT
    true AS can_use,
    v_count AS current_count,
    v_limit AS tier_limit,
    v_tier AS tier,
    'OK'::text AS reason;
END;
$$;

COMMENT ON FUNCTION can_use_nova IS 'Checks if user can use Nova based on auth, quiz completion, and rate limits.';
