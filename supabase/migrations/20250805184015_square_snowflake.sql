/*
  # Create tribe_likes table with RLS

  1. New Tables
    - `tribe_likes`
      - `post_id` (uuid, foreign key to tribe_posts)
      - `user_id` (uuid, foreign key to auth.users)
      - `created_at` (timestamp)
      - Primary key: (post_id, user_id)

  2. Security
    - Enable RLS on `tribe_likes` table
    - Add policy for users to manage own likes
    - Add policy for public read access to likes

  3. Views
    - Create `v_tribe_feed` security definer view
    - Joins posts with likes count and first like user
*/

-- Create tribe_likes table
CREATE TABLE IF NOT EXISTS tribe_likes (
  post_id uuid NOT NULL REFERENCES tribe_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (post_id, user_id)
);

-- Enable RLS
ALTER TABLE tribe_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tribe_likes
CREATE POLICY "Users can manage own likes"
  ON tribe_likes
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public can read likes"
  ON tribe_likes
  FOR SELECT
  TO public
  USING (true);

-- Create security definer view for tribe feed
CREATE OR REPLACE VIEW v_tribe_feed
WITH (security_definer = true)
AS
SELECT 
  tp.*,
  COALESCE(like_stats.likes_count, 0) as likes_count,
  like_stats.first_like_user_id,
  like_stats.first_like_avatar,
  like_stats.first_like_name,
  CASE WHEN user_likes.user_id IS NOT NULL THEN true ELSE false END as is_liked_by_current_user,
  p.full_name as author_name,
  p.avatar_url as author_avatar
FROM tribe_posts tp
LEFT JOIN profiles p ON tp.user_id = p.id
LEFT JOIN (
  SELECT 
    tl.post_id,
    COUNT(*) as likes_count,
    MIN(tl.user_id) as first_like_user_id,
    MIN(p.avatar_url) as first_like_avatar,
    MIN(p.full_name) as first_like_name
  FROM tribe_likes tl
  LEFT JOIN profiles p ON tl.user_id = p.id
  GROUP BY tl.post_id
) like_stats ON tp.id = like_stats.post_id
LEFT JOIN tribe_likes user_likes ON tp.id = user_likes.post_id AND user_likes.user_id = auth.uid()
ORDER BY tp.created_at DESC;

-- Grant access to the view
GRANT SELECT ON v_tribe_feed TO authenticated;
GRANT SELECT ON v_tribe_feed TO anon;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tribe_likes_post_id ON tribe_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_tribe_likes_user_id ON tribe_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_tribe_likes_created_at ON tribe_likes(created_at);

-- Add trigger to update tribe_posts likes_count
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE tribe_posts 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE tribe_posts 
    SET likes_count = GREATEST(likes_count - 1, 0) 
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_post_likes_count
  AFTER INSERT OR DELETE ON tribe_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_post_likes_count();