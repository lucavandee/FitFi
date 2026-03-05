/*
  # Admin panel performance indexes

  The get_admin_users RPC does heavy JOINs across:
    - profiles (JOIN on id, ORDER BY created_at)
    - style_profiles (LATERAL WHERE user_id, ORDER BY created_at)
    - customer_subscriptions (LATERAL WHERE user_id, ORDER BY created_at)

  These indexes eliminate sequential scans on the most expensive parts.
*/

-- profiles: ORDER BY created_at DESC (already likely exists but be explicit)
CREATE INDEX IF NOT EXISTS idx_profiles_created_at_desc
  ON profiles (created_at DESC);

-- style_profiles: LATERAL WHERE user_id + ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_style_profiles_user_id_created_at
  ON style_profiles (user_id, created_at DESC);

-- customer_subscriptions: LATERAL WHERE user_id + ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_customer_subscriptions_user_id_created_at
  ON customer_subscriptions (user_id, created_at DESC);

-- profiles: admin check lookup (used in every admin function security check)
CREATE INDEX IF NOT EXISTS idx_profiles_id_is_admin
  ON profiles (id, is_admin);
