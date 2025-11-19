/*
  # Create Dismissed Nova Insights Table

  1. New Table
    - `dismissed_nova_insights`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `insight_type` (text) - type of insight (seasonal, style-tip, etc)
      - `insight_hash` (text) - unique hash of insight content for deduplication
      - `dismissed_at` (timestamptz, default now())
      - `expires_at` (timestamptz) - when dismissed insight can reappear
  
  2. Security
    - Enable RLS
    - Users can only view/insert their own dismissals
    - Auto-cleanup of expired dismissals

  3. Purpose
    - Track which Nova AI insights users have dismissed
    - Prevent showing same insight repeatedly
    - Allow insights to reappear after expiration (e.g., 7 days)
*/

-- Create dismissed insights table
CREATE TABLE IF NOT EXISTS dismissed_nova_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  insight_type text NOT NULL,
  insight_hash text NOT NULL,
  dismissed_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  
  UNIQUE(user_id, insight_hash)
);

-- Enable RLS
ALTER TABLE dismissed_nova_insights ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own dismissals"
  ON dismissed_nova_insights
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can dismiss insights"
  ON dismissed_nova_insights
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own dismissals"
  ON dismissed_nova_insights
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS dismissed_insights_user_idx 
  ON dismissed_nova_insights(user_id);

CREATE INDEX IF NOT EXISTS dismissed_insights_expires_idx 
  ON dismissed_nova_insights(expires_at)
  WHERE expires_at IS NOT NULL;

-- Function to auto-cleanup expired dismissals (can be called via cron or manually)
CREATE OR REPLACE FUNCTION cleanup_expired_dismissed_insights()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM dismissed_nova_insights
  WHERE expires_at IS NOT NULL 
    AND expires_at < now();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;
