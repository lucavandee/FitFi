/*
  # Create quiz answers table

  1. New Tables
    - `quiz_answers`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `answers` (jsonb, quiz responses)
      - `completed_at` (timestamptz, completion timestamp)
      - `created_at` (timestamptz, creation timestamp)
      - `updated_at` (timestamptz, last update timestamp)

  2. Security
    - Enable RLS on `quiz_answers` table
    - Add policies for users to manage their own quiz data
*/

CREATE TABLE IF NOT EXISTS quiz_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  answers jsonb NOT NULL DEFAULT '{}',
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE quiz_answers ENABLE ROW LEVEL SECURITY;

-- Users can insert their own quiz answers
CREATE POLICY "Users can insert own quiz answers"
  ON quiz_answers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can read their own quiz answers
CREATE POLICY "Users can read own quiz answers"
  ON quiz_answers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can update their own quiz answers
CREATE POLICY "Users can update own quiz answers"
  ON quiz_answers
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_quiz_answers_user_id ON quiz_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_answers_completed ON quiz_answers(completed_at) WHERE completed_at IS NOT NULL;