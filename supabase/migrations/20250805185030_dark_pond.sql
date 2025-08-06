/*
  # Nova Intelligence Engine Tables

  1. New Tables
    - `nova_memories`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `content` (text)
      - `embedding` (vector)
      - `memory_type` (text)
      - `created_at` (timestamp)
    - `chat_messages`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `role` (text: user, assistant, system)
      - `content` (text)
      - `function_call` (jsonb)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Users can only access their own memories and messages
    - Add indexes for performance

  3. Functions
    - Function to search memories by embedding similarity
    - Function to clean old memories (>30 days)
*/

-- Enable vector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Nova memories table for conversation context
CREATE TABLE IF NOT EXISTS nova_memories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  embedding vector(768), -- OpenAI ada-002 embedding size
  memory_type text DEFAULT 'conversation' CHECK (memory_type IN ('conversation', 'preference', 'feedback', 'context')),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Chat messages table for conversation history
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content text NOT NULL,
  function_call jsonb,
  function_response jsonb,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE nova_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for nova_memories
CREATE POLICY "Users can manage own memories"
  ON nova_memories
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for chat_messages
CREATE POLICY "Users can manage own chat messages"
  ON chat_messages
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_nova_memories_user_id ON nova_memories(user_id);
CREATE INDEX IF NOT EXISTS idx_nova_memories_created_at ON nova_memories(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_nova_memories_embedding ON nova_memories USING ivfflat (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_role ON chat_messages(role);

-- Function to search memories by similarity
CREATE OR REPLACE FUNCTION search_memories(
  query_embedding vector(768),
  user_uuid uuid,
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  content text,
  memory_type text,
  similarity float,
  created_at timestamptz
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    nova_memories.id,
    nova_memories.content,
    nova_memories.memory_type,
    1 - (nova_memories.embedding <=> query_embedding) AS similarity,
    nova_memories.created_at
  FROM nova_memories
  WHERE nova_memories.user_id = user_uuid
    AND 1 - (nova_memories.embedding <=> query_embedding) > match_threshold
  ORDER BY nova_memories.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Function to clean old memories (>30 days)
CREATE OR REPLACE FUNCTION clean_old_memories()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM nova_memories
  WHERE created_at < NOW() - INTERVAL '30 days';
  
  DELETE FROM chat_messages
  WHERE created_at < NOW() - INTERVAL '30 days'
    AND role != 'system'; -- Keep system messages longer
END;
$$;

-- Security definer view for tribe feed with likes
CREATE OR REPLACE VIEW v_tribe_feed
WITH (security_invoker = false)
AS
SELECT 
  tp.*,
  COALESCE(like_counts.likes_count, 0) as likes_count,
  COALESCE(comment_counts.comments_count, 0) as comments_count,
  first_liker.user_id as first_like_user_id,
  first_liker_profile.full_name as first_like_name,
  first_liker_profile.avatar_url as first_like_avatar,
  user_likes.user_id IS NOT NULL as is_liked_by_current_user,
  tp_profile.full_name as user_full_name,
  tp_profile.avatar_url as user_avatar_url,
  outfits.title as outfit_title,
  outfits.image_url as outfit_image_url,
  outfits.match_percentage as outfit_match_percentage
FROM tribe_posts tp
LEFT JOIN profiles tp_profile ON tp.user_id = tp_profile.id
LEFT JOIN outfits ON tp.outfit_id = outfits.id
LEFT JOIN (
  SELECT post_id, COUNT(*) as likes_count
  FROM tribe_post_likes
  GROUP BY post_id
) like_counts ON tp.id = like_counts.post_id
LEFT JOIN (
  SELECT post_id, COUNT(*) as comments_count
  FROM tribe_post_comments
  GROUP BY post_id
) comment_counts ON tp.id = comment_counts.post_id
LEFT JOIN (
  SELECT DISTINCT ON (post_id) post_id, user_id, created_at
  FROM tribe_post_likes
  ORDER BY post_id, created_at ASC
) first_liker ON tp.id = first_liker.post_id
LEFT JOIN profiles first_liker_profile ON first_liker.user_id = first_liker_profile.id
LEFT JOIN tribe_post_likes user_likes ON tp.id = user_likes.post_id AND user_likes.user_id = auth.uid();

-- Grant access to the view
GRANT SELECT ON v_tribe_feed TO authenticated;
GRANT SELECT ON v_tribe_feed TO anon;