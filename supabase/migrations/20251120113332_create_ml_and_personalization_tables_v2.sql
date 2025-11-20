/*
  # ML & Personalization Infrastructure

  1. New Tables
    - `product_gaps`: Track which products we need to source
    - `product_interactions`: Track all user-product interactions
    - `user_product_preferences`: Aggregated user preferences
    - `similar_users_cache`: Cache for collaborative filtering

  2. Security
    - Enable RLS on all tables
    - Users can read/write their own data
    - Admins can read all data for analytics

  3. Functions
    - `update_user_preferences_from_interactions`: Auto-update preferences
    - `find_similar_users`: Collaborative filtering
*/

-- Product Gaps Tracking
CREATE TABLE IF NOT EXISTS product_gaps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  gender text NOT NULL,
  price_range_min numeric,
  price_range_max numeric,
  desired_count int NOT NULL,
  current_count int NOT NULL DEFAULT 0,
  priority int NOT NULL DEFAULT 3,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE product_gaps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage product gaps"
  ON product_gaps FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE INDEX IF NOT EXISTS idx_product_gaps_priority ON product_gaps(priority DESC, category, gender);

-- Product Interactions Tracking
CREATE TABLE IF NOT EXISTS product_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  interaction_type text NOT NULL,
  context jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE product_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own interactions"
  ON product_interactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own interactions"
  ON product_interactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all interactions"
  ON product_interactions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE INDEX IF NOT EXISTS idx_product_interactions_user ON product_interactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_product_interactions_product ON product_interactions(product_id, interaction_type);
CREATE INDEX IF NOT EXISTS idx_product_interactions_type ON product_interactions(interaction_type, created_at DESC);

-- User Product Preferences
CREATE TABLE IF NOT EXISTS user_product_preferences (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  preferred_brands text[] DEFAULT ARRAY[]::text[],
  disliked_brands text[] DEFAULT ARRAY[]::text[],
  preferred_colors text[] DEFAULT ARRAY[]::text[],
  disliked_colors text[] DEFAULT ARRAY[]::text[],
  preferred_price_range int4range,
  preferred_styles jsonb DEFAULT '{}'::jsonb,
  preferred_categories jsonb DEFAULT '{}'::jsonb,
  interaction_count int DEFAULT 0,
  last_interaction_at timestamptz,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_product_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences"
  ON user_product_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_product_preferences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON user_product_preferences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all preferences"
  ON user_product_preferences FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Similar Users Cache
CREATE TABLE IF NOT EXISTS similar_users_cache (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  similar_user_ids uuid[] NOT NULL DEFAULT ARRAY[]::uuid[],
  similarity_scores jsonb DEFAULT '{}'::jsonb,
  computed_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '7 days')
);

ALTER TABLE similar_users_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own similar users"
  ON similar_users_cache FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage similar users cache"
  ON similar_users_cache FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_similar_users_expires ON similar_users_cache(expires_at);

-- Function: Update user preferences
CREATE OR REPLACE FUNCTION update_user_preferences_from_interactions(p_user_id uuid)
RETURNS void AS $$
DECLARE
  v_brands text[];
  v_colors text[];
  v_prices numeric[];
  v_interaction_count int;
BEGIN
  SELECT COUNT(*) INTO v_interaction_count
  FROM product_interactions
  WHERE user_id = p_user_id;

  SELECT ARRAY_AGG(DISTINCT p.brand)
  INTO v_brands
  FROM product_interactions pi
  JOIN products p ON p.id = pi.product_id
  WHERE pi.user_id = p_user_id
    AND pi.interaction_type IN ('like', 'save', 'purchase')
    AND p.brand IS NOT NULL;

  SELECT ARRAY_AGG(DISTINCT color)
  INTO v_colors
  FROM product_interactions pi
  JOIN products p ON p.id = pi.product_id
  CROSS JOIN LATERAL unnest(p.colors) AS color
  WHERE pi.user_id = p_user_id
    AND pi.interaction_type IN ('like', 'save', 'purchase');

  SELECT ARRAY_AGG(p.price)
  INTO v_prices
  FROM product_interactions pi
  JOIN products p ON p.id = pi.product_id
  WHERE pi.user_id = p_user_id
    AND pi.interaction_type IN ('like', 'save', 'purchase')
    AND p.price IS NOT NULL;

  INSERT INTO user_product_preferences (
    user_id,
    preferred_brands,
    preferred_colors,
    preferred_price_range,
    interaction_count,
    last_interaction_at,
    updated_at
  )
  VALUES (
    p_user_id,
    COALESCE(v_brands, ARRAY[]::text[]),
    COALESCE(v_colors, ARRAY[]::text[]),
    CASE 
      WHEN v_prices IS NOT NULL AND array_length(v_prices, 1) > 0 THEN
        int4range(
          (SELECT percentile_cont(0.25) WITHIN GROUP (ORDER BY price) FROM unnest(v_prices) price)::int,
          (SELECT percentile_cont(0.75) WITHIN GROUP (ORDER BY price) FROM unnest(v_prices) price)::int,
          '[]'
        )
      ELSE NULL
    END,
    v_interaction_count,
    now(),
    now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    preferred_brands = EXCLUDED.preferred_brands,
    preferred_colors = EXCLUDED.preferred_colors,
    preferred_price_range = EXCLUDED.preferred_price_range,
    interaction_count = EXCLUDED.interaction_count,
    last_interaction_at = EXCLUDED.last_interaction_at,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Find similar users
CREATE OR REPLACE FUNCTION find_similar_users(
  p_user_id uuid,
  p_limit int DEFAULT 50
)
RETURNS TABLE (
  similar_user_id uuid,
  similarity_score numeric
) AS $$
BEGIN
  RETURN QUERY
  WITH user_profile AS (
    SELECT gender
    FROM profiles
    WHERE id = p_user_id
  ),
  user_interactions AS (
    SELECT product_id
    FROM product_interactions
    WHERE user_id = p_user_id
      AND interaction_type IN ('like', 'save')
  )
  SELECT 
    p.id as similar_user_id,
    (
      CASE WHEN p.gender = up.gender THEN 0.5 ELSE 0.0 END +
      COALESCE(
        (
          SELECT COUNT(*)::numeric / GREATEST(COUNT(DISTINCT pi.product_id), 1)
          FROM product_interactions pi
          WHERE pi.user_id = p.id
            AND pi.interaction_type IN ('like', 'save')
            AND pi.product_id IN (SELECT product_id FROM user_interactions)
        ) * 0.5,
        0.0
      )
    ) as similarity_score
  FROM profiles p
  CROSS JOIN user_profile up
  WHERE p.id != p_user_id
    AND p.id IN (
      SELECT DISTINCT user_id 
      FROM product_interactions
      WHERE interaction_type IN ('like', 'save')
    )
  ORDER BY similarity_score DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
