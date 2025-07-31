/*
  # Create onboarding behavior analytics table

  1. New Tables
    - `onboarding_behavior_analytics`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `session_id` (text, unique session identifier)
      - `question_id` (text, question identifier)
      - `action_type` (text, type of user action)
      - `timestamp` (bigint, precise timestamp)
      - `hesitation_time` (integer, time spent hesitating)
      - `confidence_score` (real, calculated confidence)
      - `metadata` (jsonb, additional behavior data)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `onboarding_behavior_analytics` table
    - Add policy for users to insert their own analytics
    - Add policy for users to read their own analytics

  3. Indexes
    - Index on user_id for fast user queries
    - Index on session_id for session analysis
    - Index on timestamp for time-based queries
*/

CREATE TABLE IF NOT EXISTS onboarding_behavior_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text NOT NULL,
  question_id text NOT NULL,
  action_type text NOT NULL,
  timestamp bigint NOT NULL,
  hesitation_time integer DEFAULT 0,
  confidence_score real DEFAULT 0.5,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE onboarding_behavior_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own behavior analytics"
  ON onboarding_behavior_analytics
  FOR INSERT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can read own behavior analytics"
  ON onboarding_behavior_analytics
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_behavior_analytics_user_id ON onboarding_behavior_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_behavior_analytics_session ON onboarding_behavior_analytics(session_id);
CREATE INDEX IF NOT EXISTS idx_behavior_analytics_timestamp ON onboarding_behavior_analytics(timestamp);