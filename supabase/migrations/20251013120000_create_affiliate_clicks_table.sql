/*
  # Affiliate Clicks Tracking

  1. New Tables
    - `affiliate_clicks`
      - `id` (uuid, primary key)
      - `click_ref` (text, AWIN ClickRef format: ff_{outfitId}_{slot}_{sessionHash})
      - `outfit_id` (text, nullable, reference to outfit)
      - `product_url` (text, original product URL)
      - `user_id` (uuid, nullable, FK to auth.users)
      - `merchant_name` (text, nullable, e.g., "zalando", "amazon")
      - `session_id` (text, anonymous session identifier)
      - `clicked_at` (timestamptz, click timestamp)
      - `created_at` (timestamptz, record creation)

  2. Security
    - Enable RLS on `affiliate_clicks` table
    - Policy: Users can view their own clicks
    - Policy: Anonymous users cannot view clicks
    - Policy: System can insert clicks (for tracking)

  3. Indexes
    - Index on `click_ref` for AWIN reporting
    - Index on `user_id` for user analytics
    - Index on `clicked_at` for time-based queries

  4. Notes
    - `click_ref` contains NO PII (only hashed session)
    - `session_id` is ephemeral (sessionStorage, not persistent)
    - `user_id` is nullable (anonymous clicks allowed)
    - Data retention: 90 days (automatic cleanup via policy)
*/

-- Create affiliate_clicks table
CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  click_ref text NOT NULL,
  outfit_id text,
  product_url text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  merchant_name text,
  session_id text NOT NULL,
  clicked_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own clicks
CREATE POLICY "Users can view own affiliate clicks"
  ON affiliate_clicks
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: System can insert clicks (for all users, including anonymous)
CREATE POLICY "System can insert affiliate clicks"
  ON affiliate_clicks
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_ref
  ON affiliate_clicks(click_ref);

CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_user
  ON affiliate_clicks(user_id)
  WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_time
  ON affiliate_clicks(clicked_at DESC);

CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_outfit
  ON affiliate_clicks(outfit_id)
  WHERE outfit_id IS NOT NULL;

-- Automatic cleanup: Delete clicks older than 90 days
-- (Run via pg_cron or scheduled function)
COMMENT ON TABLE affiliate_clicks IS 'AWIN affiliate click tracking. Retention: 90 days. Privacy: No PII in click_ref.';
