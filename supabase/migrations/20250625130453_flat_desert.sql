/*
  # Create quiz answers table

  1. New Tables
    - `quiz_answers`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `question_id` (text)
      - `answer` (jsonb)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  2. Security
    - Enable RLS on `quiz_answers` table
    - Add policy for users to read/update their own answers
*/

CREATE TABLE IF NOT EXISTS quiz_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  question_id text NOT NULL,
  answer jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, question_id)
);

ALTER TABLE quiz_answers ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own quiz answers
CREATE POLICY "Users can read own quiz answers"
  ON quiz_answers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy for users to update their own quiz answers
CREATE POLICY "Users can update own quiz answers"
  ON quiz_answers
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy for users to insert their own quiz answers
CREATE POLICY "Users can insert own quiz answers"
  ON quiz_answers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);