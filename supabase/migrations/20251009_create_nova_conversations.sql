/*
  # Nova Conversation History

  1. New Tables
    - `nova_conversations`
      - `id` (uuid, primary key)
      - `user_id` (uuid, nullable, references auth.users)
      - `session_id` (text, nullable) - for anonymous users
      - `messages` (jsonb) - array of message objects
      - `context` (jsonb) - conversation context (quiz data, preferences)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `nova_conversations` table
    - Users can only access their own conversations
    - Anonymous users can access via session_id

  3. Indexes
    - Index on user_id for fast lookups
    - Index on session_id for anonymous access
    - Index on updated_at for cleanup queries
*/

-- Create nova_conversations table
CREATE TABLE IF NOT EXISTS nova_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text,
  messages jsonb DEFAULT '[]'::jsonb,
  context jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT user_or_session CHECK (
    (user_id IS NOT NULL AND session_id IS NULL) OR
    (user_id IS NULL AND session_id IS NOT NULL)
  )
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_nova_conversations_user_id
  ON nova_conversations(user_id)
  WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_nova_conversations_session_id
  ON nova_conversations(session_id)
  WHERE session_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_nova_conversations_updated_at
  ON nova_conversations(updated_at DESC);

-- Enable RLS
ALTER TABLE nova_conversations ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can read their own conversations
CREATE POLICY "Users can read own conversations"
  ON nova_conversations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Anonymous users can read via session_id
CREATE POLICY "Anonymous users can read by session"
  ON nova_conversations
  FOR SELECT
  TO anon
  USING (session_id IS NOT NULL);

-- Policy: Authenticated users can insert their own conversations
CREATE POLICY "Users can create own conversations"
  ON nova_conversations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Anonymous users can insert via session_id
CREATE POLICY "Anonymous users can create by session"
  ON nova_conversations
  FOR INSERT
  TO anon
  WITH CHECK (session_id IS NOT NULL AND user_id IS NULL);

-- Policy: Authenticated users can update their own conversations
CREATE POLICY "Users can update own conversations"
  ON nova_conversations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Anonymous users can update via session_id
CREATE POLICY "Anonymous users can update by session"
  ON nova_conversations
  FOR UPDATE
  TO anon
  USING (session_id IS NOT NULL AND user_id IS NULL)
  WITH CHECK (session_id IS NOT NULL AND user_id IS NULL);

-- Policy: Authenticated users can delete their own conversations
CREATE POLICY "Users can delete own conversations"
  ON nova_conversations
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Anonymous users can delete via session_id
CREATE POLICY "Anonymous users can delete by session"
  ON nova_conversations
  FOR DELETE
  TO anon
  USING (session_id IS NOT NULL AND user_id IS NULL);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_nova_conversations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_nova_conversations_updated_at_trigger ON nova_conversations;
CREATE TRIGGER update_nova_conversations_updated_at_trigger
  BEFORE UPDATE ON nova_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_nova_conversations_updated_at();
