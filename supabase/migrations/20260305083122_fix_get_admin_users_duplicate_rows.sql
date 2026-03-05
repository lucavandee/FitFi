/*
  # Fix get_admin_users - duplicate rows from style_profiles

  A user can have multiple style_profiles rows (e.g. 91 for luc@fitfi.ai),
  causing the JOIN to produce one row per style_profile.
  Fix: use a LATERAL subquery with LIMIT 1 instead of a direct JOIN,
  matching the same pattern already used for customer_subscriptions.
*/

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
  LEFT JOIN LATERAL (
    SELECT sp_inner.id
    FROM style_profiles sp_inner
    WHERE sp_inner.user_id = p.id
    ORDER BY sp_inner.created_at DESC
    LIMIT 1
  ) sp ON true
  LEFT JOIN LATERAL (
    SELECT cs_inner.status
    FROM customer_subscriptions cs_inner
    WHERE cs_inner.user_id = p.id
    ORDER BY cs_inner.created_at DESC
    LIMIT 1
  ) cs ON true
  ORDER BY p.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_admin_users() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_users() TO anon;
GRANT EXECUTE ON FUNCTION public.get_admin_users() TO service_role;
