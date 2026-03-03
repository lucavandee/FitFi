/*
  # Affiliate Campaigns Table

  ## Summary
  Creates a table to manage affiliate marketing campaigns (Daisycon and other providers).
  Admins can store feed URLs per campaign and trigger syncs without re-pasting JSON each time.

  ## New Tables

  ### affiliate_campaigns
  Stores one row per affiliate campaign/program:
  - `id` - UUID primary key
  - `name` - Human-readable campaign name (e.g. "H&M NL")
  - `provider` - Affiliate network ('daisycon', 'awin', etc.)
  - `program_id` - The affiliate network's program ID
  - `feed_url` - Full feed URL including API key and parameters
  - `is_active` - Whether this campaign should be synced
  - `last_synced_at` - Timestamp of the last successful sync
  - `last_sync_log_id` - FK to daisycon_imports for the last sync
  - `product_count` - Cached count of products from last sync
  - `notes` - Optional admin notes
  - `created_at`, `updated_at` - Timestamps

  ## Security
  - RLS enabled; only admins (app_metadata.role = 'admin') can read/write
  - Regular users have no access
*/

CREATE TABLE IF NOT EXISTS affiliate_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  provider text NOT NULL DEFAULT 'daisycon',
  program_id text,
  feed_url text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  last_synced_at timestamptz,
  last_sync_log_id uuid REFERENCES daisycon_imports(id) ON DELETE SET NULL,
  product_count integer DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE affiliate_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can select affiliate_campaigns"
  ON affiliate_campaigns FOR SELECT
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admins can insert affiliate_campaigns"
  ON affiliate_campaigns FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admins can update affiliate_campaigns"
  ON affiliate_campaigns FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admins can delete affiliate_campaigns"
  ON affiliate_campaigns FOR DELETE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'campaign_id'
  ) THEN
    ALTER TABLE products ADD COLUMN campaign_id uuid REFERENCES affiliate_campaigns(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_affiliate_campaigns_provider ON affiliate_campaigns(provider);
CREATE INDEX IF NOT EXISTS idx_affiliate_campaigns_is_active ON affiliate_campaigns(is_active);
CREATE INDEX IF NOT EXISTS idx_products_campaign_id ON products(campaign_id) WHERE campaign_id IS NOT NULL;
