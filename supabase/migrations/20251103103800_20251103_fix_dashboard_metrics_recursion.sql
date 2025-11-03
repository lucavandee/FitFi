/*
  # Fix Dashboard Metrics Recursion

  1. Problem
    - get_dashboard_metrics() checks profiles table directly
    - This could cause recursion issues
    
  2. Solution
    - Update to use is_current_user_admin() helper function
    - This function is SECURITY DEFINER and won't trigger RLS
    
  3. Changes
    - Replace direct profile check with helper function call
*/

CREATE OR REPLACE FUNCTION get_dashboard_metrics()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_users int;
  v_premium_users int;
  v_founder_users int;
  v_active_7d int;
  v_quiz_completed int;
  v_quiz_completion_rate numeric;
  v_metrics jsonb;
BEGIN
  -- Use helper function to check admin (no recursion)
  IF NOT is_current_user_admin() THEN
    RAISE EXCEPTION 'Unauthorized: admin access required';
  END IF;

  -- Get total users
  SELECT COUNT(*) INTO v_total_users FROM profiles;
  
  -- Get premium users
  SELECT COUNT(*) INTO v_premium_users 
  FROM profiles 
  WHERE tier = 'premium';
  
  -- Get founder users
  SELECT COUNT(*) INTO v_founder_users 
  FROM profiles 
  WHERE tier = 'founder';
  
  -- Get active users last 7 days (users with recent activity)
  SELECT COUNT(DISTINCT p.id) INTO v_active_7d
  FROM profiles p
  WHERE p.updated_at > NOW() - INTERVAL '7 days'
     OR EXISTS (
       SELECT 1 FROM style_profiles sp 
       WHERE sp.user_id = p.id 
       AND sp.created_at > NOW() - INTERVAL '7 days'
     );
  
  -- Get users who completed quiz
  SELECT COUNT(*) INTO v_quiz_completed
  FROM style_profiles;
  
  -- Calculate completion rate
  IF v_total_users > 0 THEN
    v_quiz_completion_rate := v_quiz_completed::numeric / v_total_users::numeric;
  ELSE
    v_quiz_completion_rate := 0;
  END IF;

  -- Build metrics object
  v_metrics := jsonb_build_object(
    'total_users', v_total_users,
    'premium_users', v_premium_users + v_founder_users,
    'active_users_last_7_days', v_active_7d,
    'quiz_completion_rate', v_quiz_completion_rate,
    'tier_breakdown', jsonb_build_object(
      'free', v_total_users - v_premium_users - v_founder_users,
      'premium', v_premium_users,
      'founder', v_founder_users
    )
  );

  RETURN v_metrics;
END;
$$;
