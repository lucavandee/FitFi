/*
  # Create Outfit Match Feedback System

  1. New Tables
    - `outfit_match_feedback`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `outfit_id` (text, outfit identifier)
      - `shown_score` (integer, the calculated match score shown to user)
      - `user_rating` (integer, 1-5 stars from user)
      - `feedback_text` (text, optional written feedback)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `outfit_match_feedback` table
    - Add policy for users to create their own feedback
    - Add policy for users to view their own feedback
    - Add policy for admins to view all feedback

  3. Indexes
    - Index on user_id for fast user queries
    - Index on outfit_id for outfit analysis
    - Index on created_at for time-series analysis

  4. Notes
    - This enables machine learning on match accuracy
    - Helps improve the recommendation algorithm
    - Provides user satisfaction metrics
*/

-- Create outfit_match_feedback table
CREATE TABLE IF NOT EXISTS outfit_match_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  outfit_id TEXT NOT NULL,
  shown_score INTEGER NOT NULL CHECK (shown_score >= 0 AND shown_score <= 100),
  user_rating INTEGER NOT NULL CHECK (user_rating >= 1 AND user_rating <= 5),
  feedback_text TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_outfit_match_feedback_user_id
  ON outfit_match_feedback(user_id);

CREATE INDEX IF NOT EXISTS idx_outfit_match_feedback_outfit_id
  ON outfit_match_feedback(outfit_id);

CREATE INDEX IF NOT EXISTS idx_outfit_match_feedback_created_at
  ON outfit_match_feedback(created_at DESC);

-- Enable RLS
ALTER TABLE outfit_match_feedback ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert their own feedback
CREATE POLICY "Users can create own feedback"
  ON outfit_match_feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can view their own feedback
CREATE POLICY "Users can view own feedback"
  ON outfit_match_feedback
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Users can update their own feedback
CREATE POLICY "Users can update own feedback"
  ON outfit_match_feedback
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Admins can view all feedback (uses JWT metadata)
CREATE POLICY "Admins can view all feedback"
  ON outfit_match_feedback
  FOR SELECT
  TO authenticated
  USING (
    COALESCE(
      (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean,
      false
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_outfit_match_feedback_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_outfit_match_feedback_updated_at_trigger
  ON outfit_match_feedback;

CREATE TRIGGER update_outfit_match_feedback_updated_at_trigger
  BEFORE UPDATE ON outfit_match_feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_outfit_match_feedback_updated_at();

-- Create analytics view for admins
CREATE OR REPLACE VIEW outfit_match_feedback_analytics AS
SELECT
  outfit_id,
  COUNT(*) as feedback_count,
  AVG(shown_score) as avg_shown_score,
  AVG(user_rating) as avg_user_rating,
  AVG(user_rating * 20) as avg_user_score_pct,
  AVG(shown_score - (user_rating * 20)) as score_discrepancy,
  MIN(created_at) as first_feedback,
  MAX(created_at) as last_feedback
FROM outfit_match_feedback
GROUP BY outfit_id;

-- Grant access to authenticated users
GRANT SELECT ON outfit_match_feedback_analytics TO authenticated;