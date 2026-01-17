/*
  # Results Feedback System

  1. New Tables
    - `results_feedback`
      - `id` (uuid, primary key)
      - `user_id` (uuid, nullable - allow anonymous feedback)
      - `archetype` (text)
      - `color_profile` (jsonb, nullable)
      - `rating` (text) - 'very_helpful', 'helpful', or 'not_helpful'
      - `feedback_text` (text, nullable)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `results_feedback` table
    - Users can insert their own feedback
    - Users can read their own feedback
    - Admins can read all feedback

  3. Indexes
    - Index on user_id for quick lookups
    - Index on created_at for analytics
    - Index on rating for aggregations
*/

-- Create results_feedback table
CREATE TABLE IF NOT EXISTS results_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  archetype text NOT NULL,
  color_profile jsonb,
  rating text NOT NULL CHECK (rating IN ('very_helpful', 'helpful', 'not_helpful')),
  feedback_text text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE results_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can insert their own feedback"
  ON results_feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can read their own feedback"
  ON results_feedback
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all feedback"
  ON results_feedback
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_results_feedback_user_id
  ON results_feedback(user_id)
  WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_results_feedback_created_at
  ON results_feedback(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_results_feedback_rating
  ON results_feedback(rating);

CREATE INDEX IF NOT EXISTS idx_results_feedback_archetype
  ON results_feedback(archetype);

-- Comment
COMMENT ON TABLE results_feedback IS 'User feedback on Style Report results';
COMMENT ON COLUMN results_feedback.rating IS 'User rating: very_helpful, helpful, or not_helpful';
COMMENT ON COLUMN results_feedback.feedback_text IS 'Optional text feedback from user';
