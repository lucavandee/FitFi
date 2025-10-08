/*
  # Relax Nova Quiz Requirement (Development Mode)

  1. Changes
    - Updates `can_use_nova` function to NOT block users without completed quiz
    - Logs warning but allows access (enables testing Nova without quiz)
    - Production can re-enable strict checking if needed

  2. Security
    - Rate limits still apply (10/day free, 100/day premium, unlimited founder)
    - Profile must exist (users must be registered)
*/

-- Update can_use_nova function to relax quiz requirement
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

  -- Check if quiz completed (RELAXED - dev mode)
  SELECT EXISTS(
    SELECT 1 FROM style_profiles
    WHERE style_profiles.user_id = p_user_id
      AND completed_at IS NOT NULL
  ) INTO v_quiz_completed;

  -- DEVELOPMENT MODE: Allow access without quiz
  -- Log warning but don't block
  -- TO ENFORCE: Remove this IF block and uncomment strict check below
  IF NOT v_quiz_completed THEN
    RAISE NOTICE 'User % accessing Nova without completed quiz (dev mode)', p_user_id;
  END IF;

  -- STRICT MODE (currently disabled):
  -- IF NOT v_quiz_completed THEN
  --   RETURN QUERY SELECT
  --     false AS can_use,
  --     v_count AS current_count,
  --     v_limit AS tier_limit,
  --     v_tier AS tier,
  --     'Please complete the style quiz first.'::text AS reason;
  --   RETURN;
  -- END IF;

  -- Check rate limit
  IF v_count >= v_limit THEN
    RETURN QUERY SELECT
      false AS can_use,
      v_count AS current_count,
      v_limit AS tier_limit,
      v_tier AS tier,
      format('Daily limit reached (%s messages). Upgrade for more.', v_limit)::text AS reason;
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

COMMENT ON FUNCTION can_use_nova IS 'Checks if user can use Nova. Currently in DEV MODE (quiz not required). Rate limits still apply.';
