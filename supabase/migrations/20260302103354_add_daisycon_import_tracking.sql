/*
  # Daisycon Product Import Tracking

  ## Purpose
  Supports importing products from Daisycon affiliate product feeds.

  ## Changes
  1. Adds `source` column to products table to track origin (e.g. 'daisycon', 'brams_fruit', 'manual')
  2. Adds `external_id` column to store the Daisycon unique ID (daisycon_unique_id)
  3. Adds `affiliate_link` column as a canonical affiliate URL (separate from product_url)
  4. Creates `daisycon_imports` table to log import runs
  5. Adds unique constraint on external_id to allow safe upserts

  ## Security
  - RLS enabled on daisycon_imports
  - Only admins can read/write import logs (using app_metadata check)
*/

-- 1. Add tracking columns to products (safe, idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'source'
  ) THEN
    ALTER TABLE products ADD COLUMN source text DEFAULT 'manual';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'external_id'
  ) THEN
    ALTER TABLE products ADD COLUMN external_id text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'affiliate_link'
  ) THEN
    ALTER TABLE products ADD COLUMN affiliate_link text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'images'
  ) THEN
    ALTER TABLE products ADD COLUMN images text[] DEFAULT '{}';
  END IF;
END $$;

-- 2. Unique index on external_id for upserts (only where non-null)
CREATE UNIQUE INDEX IF NOT EXISTS products_external_id_unique
  ON products (external_id)
  WHERE external_id IS NOT NULL;

-- 3. Daisycon import log table
CREATE TABLE IF NOT EXISTS daisycon_imports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  imported_at timestamptz DEFAULT now(),
  program_name text,
  program_id integer,
  product_count integer DEFAULT 0,
  inserted_count integer DEFAULT 0,
  updated_count integer DEFAULT 0,
  skipped_count integer DEFAULT 0,
  error_message text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'success', 'error')),
  triggered_by uuid REFERENCES auth.users(id)
);

ALTER TABLE daisycon_imports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view import logs"
  ON daisycon_imports FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Admins can insert import logs"
  ON daisycon_imports FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Admins can update import logs"
  ON daisycon_imports FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );
