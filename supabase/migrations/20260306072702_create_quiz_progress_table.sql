/*
  # Create quiz_progress table

  ## Summary
  Stores in-progress quiz answers and current step for logged-in users,
  allowing them to resume a partially completed quiz from any device.

  ## New Tables
  - `quiz_progress`
    - `id` (uuid, primary key)
    - `user_id` (uuid, FK to auth.users, unique per user)
    - `current_step` (int, which question step the user is on)
    - `phase` (text, 'questions' | 'swipes' | 'calibration')
    - `answers` (jsonb, all quiz answers so far)
    - `updated_at` (timestamptz, auto-updated)

  ## Security
  - RLS enabled: users can only read/write their own progress row
  - Upsert-friendly: unique constraint on user_id
*/

CREATE TABLE IF NOT EXISTS quiz_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_step integer NOT NULL DEFAULT 0,
  phase text NOT NULL DEFAULT 'questions',
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

ALTER TABLE quiz_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own quiz progress"
  ON quiz_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quiz progress"
  ON quiz_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quiz progress"
  ON quiz_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own quiz progress"
  ON quiz_progress FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS quiz_progress_user_id_idx ON quiz_progress (user_id);
