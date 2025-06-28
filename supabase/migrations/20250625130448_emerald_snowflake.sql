/*
  # Create style preferences table

  1. New Tables
    - `style_preferences`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `casual` (integer)
      - `formal` (integer)
      - `sporty` (integer)
      - `vintage` (integer)
      - `minimalist` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  2. Security
    - Enable RLS on `style_preferences` table
    - Add policy for users to read/update their own preferences
*/

CREATE TABLE IF NOT EXISTS style_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  casual integer DEFAULT 3,
  formal integer DEFAULT 3,
  sporty integer DEFAULT 3,
  vintage integer DEFAULT 3,
  minimalist integer DEFAULT 3,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE style_preferences ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own style preferences
CREATE POLICY "Users can read own style preferences"
  ON style_preferences
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy for users to update their own style preferences
CREATE POLICY "Users can update own style preferences"
  ON style_preferences
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy for users to insert their own style preferences
CREATE POLICY "Users can insert own style preferences"
  ON style_preferences
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);