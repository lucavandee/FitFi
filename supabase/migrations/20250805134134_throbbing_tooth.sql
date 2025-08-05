/*
  # Style Tribes Community System

  1. New Tables
    - `tribes` - Community groups for style enthusiasts
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `slug` (text, unique)
      - `description` (text)
      - `cover_img` (text)
      - `member_count` (integer)
      - `created_by` (uuid, foreign key to auth.users)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `tribe_members` - Membership tracking
      - `id` (uuid, primary key)
      - `tribe_id` (uuid, foreign key to tribes)
      - `user_id` (uuid, foreign key to auth.users)
      - `role` (text: member, moderator, owner)
      - `joined_at` (timestamp)
    
    - `tribe_posts` - User posts in tribes
      - `id` (uuid, primary key)
      - `tribe_id` (uuid, foreign key to tribes)
      - `user_id` (uuid, foreign key to auth.users)
      - `outfit_id` (uuid, optional foreign key to outfits)
      - `content` (text)
      - `image_url` (text, optional)
      - `likes_count` (integer)
      - `comments_count` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `tribe_post_likes` - Post likes tracking
      - `id` (uuid, primary key)
      - `post_id` (uuid, foreign key to tribe_posts)
      - `user_id` (uuid, foreign key to auth.users)
      - `created_at` (timestamp)
    
    - `tribe_post_comments` - Post comments
      - `id` (uuid, primary key)
      - `post_id` (uuid, foreign key to tribe_posts)
      - `user_id` (uuid, foreign key to auth.users)
      - `content` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Policies for CRUD operations based on membership and roles
    - Moderation policies for owners/moderators

  3. Functions
    - Trigger to update member_count on tribe_members changes
    - Trigger to update likes_count and comments_count on tribe_posts
*/

-- Create tribes table
CREATE TABLE IF NOT EXISTS tribes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  description text,
  cover_img text,
  member_count integer DEFAULT 0,
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create tribe_members table
CREATE TABLE IF NOT EXISTS tribe_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tribe_id uuid REFERENCES tribes(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'owner')),
  joined_at timestamptz DEFAULT now(),
  UNIQUE(tribe_id, user_id)
);

-- Create tribe_posts table
CREATE TABLE IF NOT EXISTS tribe_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tribe_id uuid REFERENCES tribes(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  outfit_id uuid REFERENCES outfits(id) ON DELETE SET NULL,
  content text NOT NULL,
  image_url text,
  likes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create tribe_post_likes table
CREATE TABLE IF NOT EXISTS tribe_post_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES tribe_posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Create tribe_post_comments table
CREATE TABLE IF NOT EXISTS tribe_post_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES tribe_posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create remote_flags table for feature flags
CREATE TABLE IF NOT EXISTS remote_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_name text NOT NULL UNIQUE,
  enabled boolean DEFAULT false,
  percentage integer DEFAULT 0 CHECK (percentage >= 0 AND percentage <= 100),
  config jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE tribes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tribe_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tribe_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tribe_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tribe_post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE remote_flags ENABLE ROW LEVEL SECURITY;

-- Tribes policies
CREATE POLICY "Anyone can read tribes"
  ON tribes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create tribes"
  ON tribes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Tribe owners can update their tribes"
  ON tribes FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Tribe owners can delete their tribes"
  ON tribes FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Tribe members policies
CREATE POLICY "Anyone can read tribe memberships"
  ON tribe_members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can join tribes"
  ON tribe_members FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave tribes they joined"
  ON tribe_members FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Tribe owners and moderators can manage members"
  ON tribe_members FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tribe_members tm
      WHERE tm.tribe_id = tribe_members.tribe_id
      AND tm.user_id = auth.uid()
      AND tm.role IN ('owner', 'moderator')
    )
  );

-- Tribe posts policies
CREATE POLICY "Anyone can read tribe posts"
  ON tribe_posts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Tribe members can create posts"
  ON tribe_posts FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM tribe_members tm
      WHERE tm.tribe_id = tribe_posts.tribe_id
      AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Post authors can update their posts"
  ON tribe_posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Post authors and moderators can delete posts"
  ON tribe_posts FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM tribe_members tm
      WHERE tm.tribe_id = tribe_posts.tribe_id
      AND tm.user_id = auth.uid()
      AND tm.role IN ('owner', 'moderator')
    )
  );

-- Tribe post likes policies
CREATE POLICY "Anyone can read post likes"
  ON tribe_post_likes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can like posts"
  ON tribe_post_likes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike their own likes"
  ON tribe_post_likes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Tribe post comments policies
CREATE POLICY "Anyone can read comments"
  ON tribe_post_comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can comment"
  ON tribe_post_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Comment authors can update their comments"
  ON tribe_post_comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Comment authors and moderators can delete comments"
  ON tribe_post_comments FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM tribe_posts tp
      JOIN tribe_members tm ON tp.tribe_id = tm.tribe_id
      WHERE tp.id = tribe_post_comments.post_id
      AND tm.user_id = auth.uid()
      AND tm.role IN ('owner', 'moderator')
    )
  );

-- Remote flags policies (admin only)
CREATE POLICY "Anyone can read feature flags"
  ON remote_flags FOR SELECT
  TO authenticated
  USING (true);

-- Create levels data
INSERT INTO levels (id, level_name, min_xp, max_xp, icon, color, perks) VALUES
(1, 'Style Starter', 0, 99, '🌱', '#10b981', ARRAY['Basic recommendations']),
(2, 'Style Explorer', 100, 299, '🔍', '#3b82f6', ARRAY['Daily challenges', 'Basic analytics']),
(3, 'Style Enthusiast', 300, 599, '✨', '#8b5cf6', ARRAY['Weekly challenges', 'Outfit history']),
(4, 'Trendsetter', 600, 999, '🎯', '#f59e0b', ARRAY['Premium challenges', 'Style insights']),
(5, 'Style Influencer', 1000, 1499, '⭐', '#ef4444', ARRAY['Exclusive content', 'Early access']),
(6, 'Style Icon', 1500, 2499, '👑', '#8b5cf6', ARRAY['VIP support', 'Custom styling']),
(7, 'Style Legend', 2500, 4999, '💎', '#fbbf24', ARRAY['Legendary status', 'All features']),
(8, 'Style Master', 5000, 7499, '🏆', '#f97316', ARRAY['Master privileges', 'Beta features']),
(9, 'Style Guru', 7500, 9999, '🌟', '#a855f7', ARRAY['Guru status', 'Mentorship']),
(10, 'Style Deity', 10000, NULL, '⚡', '#06b6d4', ARRAY['Ultimate status', 'All perks'])
ON CONFLICT (id) DO NOTHING;

-- Create default tribes
INSERT INTO tribes (name, slug, description, cover_img, created_by) VALUES
('Minimalist Masters', 'minimalist-masters', 'Voor liefhebbers van clean lines en tijdloze stijl', 'https://images.pexels.com/photos/5935748/pexels-photo-5935748.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&dpr=2', (SELECT id FROM auth.users LIMIT 1)),
('Streetwear Society', 'streetwear-society', 'Urban fashion en street culture enthusiasts', 'https://images.pexels.com/photos/2043590/pexels-photo-2043590.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&dpr=2', (SELECT id FROM auth.users LIMIT 1)),
('Vintage Vibes', 'vintage-vibes', 'Retro fashion en vintage finds community', 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&dpr=2', (SELECT id FROM auth.users LIMIT 1)),
('Business Casual Club', 'business-casual-club', 'Professional styling voor de moderne werkplek', 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&dpr=2', (SELECT id FROM auth.users LIMIT 1))
ON CONFLICT (slug) DO NOTHING;

-- Enable style tribes feature flag
INSERT INTO remote_flags (flag_name, enabled, percentage, config) VALUES
('style_tribes', true, 100, '{"max_tribes_per_user": 10, "max_posts_per_day": 5}')
ON CONFLICT (flag_name) DO UPDATE SET
enabled = true,
percentage = 100,
updated_at = now();

-- Create RPC functions for leaderboards and stats
CREATE OR REPLACE FUNCTION get_tribe_leaderboard(tribe_uuid uuid, limit_count integer DEFAULT 10)
RETURNS TABLE (
  user_id uuid,
  username text,
  posts_count bigint,
  likes_received bigint,
  rank bigint
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.user_id,
    COALESCE(pr.full_name, 'Anonymous') as username,
    COUNT(p.id) as posts_count,
    COALESCE(SUM(p.likes_count), 0) as likes_received,
    ROW_NUMBER() OVER (ORDER BY COUNT(p.id) DESC, COALESCE(SUM(p.likes_count), 0) DESC) as rank
  FROM tribe_posts p
  LEFT JOIN profiles pr ON p.user_id = pr.id
  WHERE p.tribe_id = tribe_uuid
  GROUP BY p.user_id, pr.full_name
  ORDER BY posts_count DESC, likes_received DESC
  LIMIT limit_count;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_tribe_leaderboard TO authenticated;

-- Create function to update member count
CREATE OR REPLACE FUNCTION update_tribe_member_count()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE tribes 
    SET member_count = member_count + 1,
        updated_at = now()
    WHERE id = NEW.tribe_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE tribes 
    SET member_count = member_count - 1,
        updated_at = now()
    WHERE id = OLD.tribe_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Create trigger for member count updates
DROP TRIGGER IF EXISTS trigger_update_tribe_member_count ON tribe_members;
CREATE TRIGGER trigger_update_tribe_member_count
  AFTER INSERT OR DELETE ON tribe_members
  FOR EACH ROW
  EXECUTE FUNCTION update_tribe_member_count();

-- Create function to update post counts
CREATE OR REPLACE FUNCTION update_post_counts()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF TG_TABLE_NAME = 'tribe_post_likes' THEN
      UPDATE tribe_posts 
      SET likes_count = likes_count + 1,
          updated_at = now()
      WHERE id = NEW.post_id;
    ELSIF TG_TABLE_NAME = 'tribe_post_comments' THEN
      UPDATE tribe_posts 
      SET comments_count = comments_count + 1,
          updated_at = now()
      WHERE id = NEW.post_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF TG_TABLE_NAME = 'tribe_post_likes' THEN
      UPDATE tribe_posts 
      SET likes_count = likes_count - 1,
          updated_at = now()
      WHERE id = OLD.post_id;
    ELSIF TG_TABLE_NAME = 'tribe_post_comments' THEN
      UPDATE tribe_posts 
      SET comments_count = comments_count - 1,
          updated_at = now()
      WHERE id = OLD.post_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Create triggers for post counts
DROP TRIGGER IF EXISTS trigger_update_likes_count ON tribe_post_likes;
CREATE TRIGGER trigger_update_likes_count
  AFTER INSERT OR DELETE ON tribe_post_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_post_counts();

DROP TRIGGER IF EXISTS trigger_update_comments_count ON tribe_post_comments;
CREATE TRIGGER trigger_update_comments_count
  AFTER INSERT OR DELETE ON tribe_post_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_post_counts();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tribe_members_tribe_id ON tribe_members(tribe_id);
CREATE INDEX IF NOT EXISTS idx_tribe_members_user_id ON tribe_members(user_id);
CREATE INDEX IF NOT EXISTS idx_tribe_posts_tribe_id ON tribe_posts(tribe_id);
CREATE INDEX IF NOT EXISTS idx_tribe_posts_user_id ON tribe_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_tribe_posts_created_at ON tribe_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tribe_post_likes_post_id ON tribe_post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_tribe_post_comments_post_id ON tribe_post_comments(post_id);