/*
  # Create Outfit Swaps Tracking Table

  1. New Tables
    - `outfit_swaps`
      - `id` (uuid, primary key)
      - `outfit_id` (text) - Reference to original outfit
      - `user_id` (uuid) - Reference to users table
      - `session_id` (text) - For anonymous users
      - `category` (text) - Category that was swapped (top/bottom/shoes/accessory)
      - `old_product_id` (text) - Product that was replaced
      - `new_product_id` (text) - Product that replaced it
      - `new_product_brand` (text) - Brand of new product (for pattern analysis)
      - `new_product_price` (numeric) - Price of new product
      - `score_before` (numeric) - Outfit score before swap
      - `score_after` (numeric) - Outfit score after swap
      - `improvement` (boolean) - Whether swap improved score
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `outfit_swaps` table
    - Add policies for authenticated users to manage their swaps
    - Add policies for anonymous users with session_id

  3. Indexes
    - Index on user_id for quick user lookups
    - Index on session_id for anonymous user lookups
    - Index on created_at for temporal queries
    - Index on improvement for analytics
*/

-- Create outfit_swaps table
CREATE TABLE IF NOT EXISTS outfit_swaps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  outfit_id text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text,
  category text NOT NULL CHECK (category IN ('top', 'bottom', 'shoes', 'accessory')),
  old_product_id text NOT NULL,
  new_product_id text NOT NULL,
  new_product_brand text,
  new_product_price numeric DEFAULT 0,
  score_before numeric NOT NULL DEFAULT 0,
  score_after numeric NOT NULL DEFAULT 0,
  improvement boolean GENERATED ALWAYS AS (score_after > score_before) STORED,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_outfit_swaps_user_id ON outfit_swaps(user_id);
CREATE INDEX IF NOT EXISTS idx_outfit_swaps_session_id ON outfit_swaps(session_id);
CREATE INDEX IF NOT EXISTS idx_outfit_swaps_created_at ON outfit_swaps(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_outfit_swaps_improvement ON outfit_swaps(improvement);
CREATE INDEX IF NOT EXISTS idx_outfit_swaps_category ON outfit_swaps(category);

-- Enable RLS
ALTER TABLE outfit_swaps ENABLE ROW LEVEL SECURITY;

-- Policies for authenticated users
CREATE POLICY "Users can view own swaps"
  ON outfit_swaps FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own swaps"
  ON outfit_swaps FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policies for anonymous users with session_id
CREATE POLICY "Anonymous users can view own session swaps"
  ON outfit_swaps FOR SELECT
  TO anon
  USING (session_id IS NOT NULL);

CREATE POLICY "Anonymous users can insert session swaps"
  ON outfit_swaps FOR INSERT
  TO anon
  WITH CHECK (session_id IS NOT NULL);

-- Analytics function: Get swap success rate
CREATE OR REPLACE FUNCTION get_swap_success_rate(p_user_id uuid DEFAULT NULL, p_session_id text DEFAULT NULL)
RETURNS TABLE (
  total_swaps bigint,
  successful_swaps bigint,
  success_rate numeric,
  avg_score_improvement numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::bigint AS total_swaps,
    COUNT(*) FILTER (WHERE improvement)::bigint AS successful_swaps,
    ROUND((COUNT(*) FILTER (WHERE improvement)::numeric / NULLIF(COUNT(*)::numeric, 0) * 100), 2) AS success_rate,
    ROUND(AVG(score_after - score_before) FILTER (WHERE improvement), 3) AS avg_score_improvement
  FROM outfit_swaps
  WHERE (p_user_id IS NULL OR user_id = p_user_id)
    AND (p_session_id IS NULL OR session_id = p_session_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Analytics function: Get popular swaps by category
CREATE OR REPLACE FUNCTION get_popular_swap_categories()
RETURNS TABLE (
  category text,
  swap_count bigint,
  success_rate numeric,
  avg_improvement numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    os.category,
    COUNT(*)::bigint AS swap_count,
    ROUND((COUNT(*) FILTER (WHERE os.improvement)::numeric / NULLIF(COUNT(*)::numeric, 0) * 100), 2) AS success_rate,
    ROUND(AVG(os.score_after - os.score_before) FILTER (WHERE os.improvement), 3) AS avg_improvement
  FROM outfit_swaps os
  GROUP BY os.category
  ORDER BY swap_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
