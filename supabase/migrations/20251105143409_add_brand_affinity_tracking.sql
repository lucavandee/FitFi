/*
  # Brand Affinity Tracking

  1. New Table
    - `brand_preferences`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users, nullable for anonymous sessions)
      - `session_id` (text, nullable, for pre-login tracking)
      - `brand` (text, the brand name)
      - `affinity_score` (integer, cumulative score based on swipes/interactions)
      - `swipe_count` (integer, number of times brand appeared in swipes)
      - `like_count` (integer, number of right swipes on this brand)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `brand_preferences` table
    - Add policy for users to read/write their own brand preferences
    - Add policy for anonymous sessions to read/write using session_id

  3. Indexes
    - Index on user_id for fast lookups
    - Index on session_id for anonymous tracking
    - Index on brand for aggregation queries
*/

CREATE TABLE IF NOT EXISTS brand_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text,
  brand text NOT NULL,
  affinity_score integer DEFAULT 0,
  swipe_count integer DEFAULT 0,
  like_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  -- Ensure one record per user/session + brand combination
  CONSTRAINT unique_user_brand UNIQUE NULLS NOT DISTINCT (user_id, session_id, brand)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_brand_preferences_user_id ON brand_preferences(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_brand_preferences_session_id ON brand_preferences(session_id) WHERE session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_brand_preferences_brand ON brand_preferences(brand);

-- Enable RLS
ALTER TABLE brand_preferences ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read/write their own brand preferences
CREATE POLICY "Users can manage own brand preferences"
  ON brand_preferences
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Anonymous sessions can manage their brand preferences
CREATE POLICY "Sessions can manage own brand preferences"
  ON brand_preferences
  FOR ALL
  TO anon
  USING (session_id IS NOT NULL)
  WITH CHECK (session_id IS NOT NULL);

-- Function to update brand affinity after swipe
CREATE OR REPLACE FUNCTION update_brand_affinity(
  p_user_id uuid,
  p_session_id text,
  p_brand text,
  p_liked boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO brand_preferences (
    user_id,
    session_id,
    brand,
    affinity_score,
    swipe_count,
    like_count
  )
  VALUES (
    p_user_id,
    p_session_id,
    p_brand,
    CASE WHEN p_liked THEN 10 ELSE -2 END,
    1,
    CASE WHEN p_liked THEN 1 ELSE 0 END
  )
  ON CONFLICT (user_id, session_id, brand)
  DO UPDATE SET
    affinity_score = brand_preferences.affinity_score + CASE WHEN p_liked THEN 10 ELSE -2 END,
    swipe_count = brand_preferences.swipe_count + 1,
    like_count = brand_preferences.like_count + CASE WHEN p_liked THEN 1 ELSE 0 END,
    updated_at = now();
END;
$$;
