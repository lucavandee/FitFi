/*
  # Product Cache Table

  1. New Table
    - `product_cache`: Stores cached product query results
      - `cache_key` (primary key): Unique key based on filter criteria
      - `products` (jsonb): Cached product array
      - `created_at`, `expires_at`: Cache management

  2. Security
    - Public read access (for performance)
    - System can write (no RLS needed for cache)

  3. Indexes
    - Index on expires_at for cleanup queries
*/

CREATE TABLE IF NOT EXISTS product_cache (
  cache_key text PRIMARY KEY,
  products jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_product_cache_expires ON product_cache(expires_at);

-- No RLS needed for cache table (public read, system write)
ALTER TABLE product_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read cache"
  ON product_cache FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "System can write cache"
  ON product_cache FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Function to cleanup expired cache
CREATE OR REPLACE FUNCTION cleanup_expired_product_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM product_cache WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql;
