/*
  # Fix get_admin_users function - force schema cache reload

  The PostgREST schema cache may be stale causing 400 errors on the RPC call.
  This recreates the function to force a cache reload and also adds a direct
  fallback query approach for admin users.
*/

-- Drop and recreate to force PostgREST schema cache reload
DROP FUNCTION IF EXISTS public.get_admin_users();

CREATE OR REPLACE FUNCTION public.get_admin_users()
RETURNS TABLE(
  id uuid,
  email text,
  full_name text,
  tier text,
  is_admin boolean,
  created_at timestamptz,
  last_sign_in timestamptz,
  quiz_completed boolean,
  referral_count integer,
  subscription_status text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_admin boolean;
BEGIN
  SELECT profiles.is_admin INTO v_is_admin
  FROM profiles
  WHERE profiles.id = auth.uid();

  IF NOT COALESCE(v_is_admin, false) THEN
    RAISE EXCEPTION 'Access denied: admin only';
  END IF;

  RETURN QUERY
  SELECT
    p.id,
    au.email::text,
    p.full_name::text,
    COALESCE(p.tier, 'free')::text AS tier,
    COALESCE(p.is_admin, false) AS is_admin,
    p.created_at,
    au.last_sign_in_at AS last_sign_in,
    (sp.id IS NOT NULL) AS quiz_completed,
    COALESCE(p.referral_count, 0) AS referral_count,
    cs.status::text AS subscription_status
  FROM profiles p
  JOIN auth.users au ON au.id = p.id
  LEFT JOIN style_profiles sp ON sp.user_id = p.id
  LEFT JOIN LATERAL (
    SELECT status
    FROM customer_subscriptions
    WHERE user_id = p.id
    ORDER BY created_at DESC
    LIMIT 1
  ) cs ON true
  ORDER BY p.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_admin_users() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_users() TO anon;
GRANT EXECUTE ON FUNCTION public.get_admin_users() TO service_role;
