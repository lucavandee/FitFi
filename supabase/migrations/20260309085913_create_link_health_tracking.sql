/*
  # Create Link Health Tracking System

  1. New Tables
    - `link_health`
      - `id` (uuid, primary key)
      - `product_id` (uuid, references products)
      - `url` (text, the URL that was checked)
      - `status` (text, 'healthy' | 'broken' | 'timeout' | 'redirect' | 'unknown')
      - `http_status` (integer, nullable, the HTTP response code)
      - `last_checked_at` (timestamptz, when the check was performed)
      - `failure_count` (integer, consecutive failures)
      - `first_failed_at` (timestamptz, nullable, when it first started failing)
      - `created_at` (timestamptz)

  2. Changes
    - Adds `link_status` column to `products` table ('active' | 'broken' | 'unavailable')
    - Adds `link_last_checked_at` column to `products` table

  3. Security
    - Enable RLS on `link_health` table
    - Only service role / admin can write; authenticated users can read healthy status
    - Products link_status is readable by authenticated users through existing products policies

  4. Indexes
    - Index on `link_health.product_id` for fast lookups
    - Index on `link_health.status` for filtering broken links
    - Index on `products.link_status` for filtering in product queries
*/

CREATE TABLE IF NOT EXISTS link_health (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  url text NOT NULL,
  status text NOT NULL DEFAULT 'unknown' CHECK (status IN ('healthy', 'broken', 'timeout', 'redirect', 'unknown')),
  http_status integer,
  last_checked_at timestamptz NOT NULL DEFAULT now(),
  failure_count integer NOT NULL DEFAULT 0,
  first_failed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE link_health ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view link health"
  ON link_health
  FOR SELECT
  TO authenticated
  USING (true);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'link_status'
  ) THEN
    ALTER TABLE products ADD COLUMN link_status text NOT NULL DEFAULT 'active' CHECK (link_status IN ('active', 'broken', 'unavailable'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'link_last_checked_at'
  ) THEN
    ALTER TABLE products ADD COLUMN link_last_checked_at timestamptz;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_link_health_product_id ON link_health(product_id);
CREATE INDEX IF NOT EXISTS idx_link_health_status ON link_health(status);
CREATE INDEX IF NOT EXISTS idx_products_link_status ON products(link_status);

CREATE OR REPLACE FUNCTION update_product_link_status(
  p_product_id uuid,
  p_status text,
  p_http_status integer DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_failure_count integer;
  v_first_failed timestamptz;
BEGIN
  SELECT failure_count, first_failed_at
  INTO v_current_failure_count, v_first_failed
  FROM link_health
  WHERE product_id = p_product_id
  ORDER BY last_checked_at DESC
  LIMIT 1;

  IF p_status = 'healthy' THEN
    v_current_failure_count := 0;
    v_first_failed := NULL;
  ELSE
    v_current_failure_count := COALESCE(v_current_failure_count, 0) + 1;
    IF v_first_failed IS NULL THEN
      v_first_failed := now();
    END IF;
  END IF;

  INSERT INTO link_health (product_id, url, status, http_status, failure_count, first_failed_at)
  SELECT p_product_id,
         COALESCE(p.affiliate_url, p.product_url, ''),
         p_status,
         p_http_status,
         v_current_failure_count,
         v_first_failed
  FROM products p
  WHERE p.id = p_product_id;

  IF v_current_failure_count >= 3 THEN
    UPDATE products
    SET link_status = 'broken',
        link_last_checked_at = now()
    WHERE id = p_product_id;
  ELSIF p_status = 'healthy' THEN
    UPDATE products
    SET link_status = 'active',
        link_last_checked_at = now()
    WHERE id = p_product_id;
  ELSE
    UPDATE products
    SET link_last_checked_at = now()
    WHERE id = p_product_id;
  END IF;
END;
$$;