/*
  # User Feedback System for Nova AI

  1. New Tables
    - `user_feedback`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `item_id` (text, outfit or product ID)
      - `item_type` (text, 'outfit' or 'product')
      - `feedback_type` (text, 'like', 'dislike', 'love', 'not_interested')
      - `reason` (text, optional reason)
      - `context` (jsonb, additional context data)
      - `timestamp` (bigint, unix timestamp)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `user_feedback` table
    - Add policies for users to manage their own feedback
*/

CREATE TABLE IF NOT EXISTS user_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id text NOT NULL,
  item_type text NOT NULL CHECK (item_type IN ('outfit', 'product')),
  feedback_type text NOT NULL CHECK (feedback_type IN ('like', 'dislike', 'love', 'not_interested')),
  reason text,
  context jsonb DEFAULT '{}',
  timestamp bigint NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own feedback"
  ON user_feedback
  FOR INSERT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can read own feedback"
  ON user_feedback
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own feedback"
  ON user_feedback
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own feedback"
  ON user_feedback
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_feedback_user_id ON user_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_user_feedback_item ON user_feedback(item_id, item_type);
CREATE INDEX IF NOT EXISTS idx_user_feedback_timestamp ON user_feedback(timestamp);
CREATE INDEX IF NOT EXISTS idx_user_feedback_type ON user_feedback(feedback_type);