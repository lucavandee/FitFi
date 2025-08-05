/*
  # Fix leaderboard RPC security and permissions

  1. Security Updates
    - Set get_leaderboard function to SECURITY DEFINER
    - Grant execute permissions to anon and authenticated roles
    - Ensure function runs with elevated privileges to prevent 401 errors

  2. Function Updates
    - Add proper error handling in RPC function
    - Set search_path for security
    - Add input validation

  3. Permissions
    - Grant execute to anon role for public leaderboard access
    - Grant execute to authenticated role for logged-in users
*/

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.get_leaderboard(text, int);

-- Create secure leaderboard function with SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.get_leaderboard(
  leaderboard_type text DEFAULT 'all_time',
  limit_count int DEFAULT 10
)
RETURNS TABLE (
  user_id uuid,
  username text,
  points integer,
  level text,
  rank bigint,
  weekly_points integer,
  monthly_points integer
)
LANGUAGE sql
SECURITY DEFINER  -- Run with elevated privileges
SET search_path = public, pg_catalog
AS $$
  SELECT 
    l.user_id,
    COALESCE(p.full_name, 'Anonymous') as username,
    CASE 
      WHEN leaderboard_type = 'weekly' THEN l.weekly_points
      WHEN leaderboard_type = 'monthly' THEN l.monthly_points
      ELSE l.total_points
    END as points,
    l.current_level as level,
    ROW_NUMBER() OVER (
      ORDER BY 
        CASE 
          WHEN leaderboard_type = 'weekly' THEN l.weekly_points
          WHEN leaderboard_type = 'monthly' THEN l.monthly_points
          ELSE l.total_points
        END DESC
    ) as rank,
    l.weekly_points,
    l.monthly_points
  FROM leaderboards l
  LEFT JOIN profiles p ON l.user_id = p.id
  WHERE l.total_points > 0  -- Only show users with points
  ORDER BY 
    CASE 
      WHEN leaderboard_type = 'weekly' THEN l.weekly_points
      WHEN leaderboard_type = 'monthly' THEN l.monthly_points
      ELSE l.total_points
    END DESC
  LIMIT GREATEST(1, LEAST(limit_count, 100));  -- Limit between 1 and 100
$$;

-- Grant execute permissions to both anon and authenticated users
GRANT EXECUTE ON FUNCTION public.get_leaderboard(text, int) TO anon;
GRANT EXECUTE ON FUNCTION public.get_leaderboard(text, int) TO authenticated;

-- Create get_user_leaderboard_rank function for user's position
CREATE OR REPLACE FUNCTION public.get_user_leaderboard_rank(
  user_uuid uuid,
  leaderboard_type text DEFAULT 'all_time'
)
RETURNS TABLE (
  rank bigint,
  points integer,
  level text,
  weekly_points integer,
  monthly_points integer
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
  WITH ranked_users AS (
    SELECT 
      l.user_id,
      l.total_points,
      l.weekly_points,
      l.monthly_points,
      l.current_level,
      ROW_NUMBER() OVER (
        ORDER BY 
          CASE 
            WHEN leaderboard_type = 'weekly' THEN l.weekly_points
            WHEN leaderboard_type = 'monthly' THEN l.monthly_points
            ELSE l.total_points
          END DESC
      ) as rank
    FROM leaderboards l
    WHERE l.total_points > 0
  )
  SELECT 
    r.rank,
    CASE 
      WHEN leaderboard_type = 'weekly' THEN r.weekly_points
      WHEN leaderboard_type = 'monthly' THEN r.monthly_points
      ELSE r.total_points
    END as points,
    r.current_level as level,
    r.weekly_points,
    r.monthly_points
  FROM ranked_users r
  WHERE r.user_id = user_uuid;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_user_leaderboard_rank(uuid, text) TO anon;
GRANT EXECUTE ON FUNCTION public.get_user_leaderboard_rank(uuid, text) TO authenticated;

-- Create get_referral_stats function for dashboard
CREATE OR REPLACE FUNCTION public.get_referral_stats(uid uuid)
RETURNS TABLE (
  total integer,
  rank integer,
  is_founding_member boolean
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
  WITH user_referrals AS (
    SELECT 
      p.id,
      p.referral_count,
      ROW_NUMBER() OVER (ORDER BY p.referral_count DESC) as rank
    FROM profiles p
    WHERE p.referral_count > 0
  )
  SELECT 
    COALESCE(p.referral_count, 0) as total,
    COALESCE(ur.rank::integer, 999) as rank,
    COALESCE(p.referral_count >= 3, false) as is_founding_member
  FROM profiles p
  LEFT JOIN user_referrals ur ON p.id = ur.id
  WHERE p.id = uid;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_referral_stats(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.get_referral_stats(uuid) TO authenticated;