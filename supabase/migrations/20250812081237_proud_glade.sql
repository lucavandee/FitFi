/*
  # Create Tribes Schema

  1. New Tables
    - `tribes`
      - `id` (text, primary key)
      - `name` (text, not null)
      - `slug` (text, unique, not null)
      - `description` (text)
      - `cover_img` (text)
      - `member_count` (integer, default 0)
      - `created_by` (uuid, references auth.users)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())
    
    - `tribe_members`
      - `id` (uuid, primary key)
      - `tribe_id` (text, references tribes)
      - `user_id` (uuid, references auth.users)
      - `role` (text, default 'member')
      - `joined_at` (timestamptz, default now())
    
    - `tribe_posts`
      - `id` (uuid, primary key)
      - `tribe_id` (text, references tribes)
      - `user_id` (uuid, references auth.users)
      - `content` (text, not null)
      - `image_url` (text)
      - `likes_count` (integer, default 0)
      - `comments_count` (integer, default 0)
      - `created_at` (timestamptz, default now())
    
    - `tribe_post_likes`
      - `id` (uuid, primary key)
      - `post_id` (uuid, references tribe_posts)
      - `user_id` (uuid, references auth.users)
      - `created_at` (timestamptz, default now())
    
    - `tribe_post_comments`
      - `id` (uuid, primary key)
      - `post_id` (uuid, references tribe_posts)
      - `user_id` (uuid, references auth.users)
      - `content` (text, not null)
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on all tribe tables
    - Add policies for public read access
    - Add policies for authenticated user actions
    - Add policies for tribe membership requirements

  3. Indexes
    - Add performance indexes for common queries
    - Add unique constraints for data integrity
*/

-- Create tribes table
CREATE TABLE IF NOT EXISTS tribes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text NOT NULL,
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

-- Enable Row Level Security
ALTER TABLE tribes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tribe_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tribe_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tribe_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tribe_post_comments ENABLE ROW LEVEL SECURITY;

-- Tribes policies
CREATE POLICY "Public read tribes"
  ON tribes
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users create tribes"
  ON tribes
  FOR INSERT
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Owners update tribes"
  ON tribes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

-- Tribe members policies
CREATE POLICY "Public read members"
  ON tribe_members
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users join tribes"
  ON tribe_members
  FOR INSERT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users leave tribes"
  ON tribe_members
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Tribe posts policies
CREATE POLICY "Public read posts"
  ON tribe_posts
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Members create posts"
  ON tribe_posts
  FOR INSERT
  TO authenticated
  USING (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM tribe_members 
      WHERE tribe_id = tribe_posts.tribe_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Authors update own posts"
  ON tribe_posts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authors delete own posts"
  ON tribe_posts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Tribe post likes policies
CREATE POLICY "Public read likes"
  ON tribe_post_likes
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users like posts"
  ON tribe_post_likes
  FOR INSERT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users unlike posts"
  ON tribe_post_likes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Tribe post comments policies
CREATE POLICY "Public read comments"
  ON tribe_post_comments
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users comment"
  ON tribe_post_comments
  FOR INSERT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authors update own comments"
  ON tribe_post_comments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authors delete own comments"
  ON tribe_post_comments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_tribes_slug ON tribes(slug);
CREATE INDEX IF NOT EXISTS idx_tribes_created_by ON tribes(created_by);
CREATE INDEX IF NOT EXISTS idx_tribe_members_tribe_id ON tribe_members(tribe_id);
CREATE INDEX IF NOT EXISTS idx_tribe_members_user_id ON tribe_members(user_id);
CREATE INDEX IF NOT EXISTS idx_tribe_posts_tribe_id ON tribe_posts(tribe_id);
CREATE INDEX IF NOT EXISTS idx_tribe_posts_user_id ON tribe_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_tribe_posts_created_at ON tribe_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tribe_post_likes_post_id ON tribe_post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_tribe_post_likes_user_id ON tribe_post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_tribe_post_comments_post_id ON tribe_post_comments(post_id);

-- Update member count trigger function
CREATE OR REPLACE FUNCTION update_tribe_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE tribes 
    SET member_count = member_count + 1,
        updated_at = now()
    WHERE id = NEW.tribe_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE tribes 
    SET member_count = GREATEST(member_count - 1, 0),
        updated_at = now()
    WHERE id = OLD.tribe_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for member count updates
DROP TRIGGER IF EXISTS tribe_member_count_trigger ON tribe_members;
CREATE TRIGGER tribe_member_count_trigger
  AFTER INSERT OR DELETE ON tribe_members
  FOR EACH ROW
  EXECUTE FUNCTION update_tribe_member_count();

-- Update post counts trigger function
CREATE OR REPLACE FUNCTION update_post_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF TG_TABLE_NAME = 'tribe_post_likes' THEN
      UPDATE tribe_posts 
      SET likes_count = likes_count + 1
      WHERE id = NEW.post_id;
    ELSIF TG_TABLE_NAME = 'tribe_post_comments' THEN
      UPDATE tribe_posts 
      SET comments_count = comments_count + 1
      WHERE id = NEW.post_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF TG_TABLE_NAME = 'tribe_post_likes' THEN
      UPDATE tribe_posts 
      SET likes_count = GREATEST(likes_count - 1, 0)
      WHERE id = OLD.post_id;
    ELSIF TG_TABLE_NAME = 'tribe_post_comments' THEN
      UPDATE tribe_posts 
      SET comments_count = GREATEST(comments_count - 1, 0)
      WHERE id = OLD.post_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for post counts
DROP TRIGGER IF EXISTS tribe_post_likes_count_trigger ON tribe_post_likes;
CREATE TRIGGER tribe_post_likes_count_trigger
  AFTER INSERT OR DELETE ON tribe_post_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_post_counts();

DROP TRIGGER IF EXISTS tribe_post_comments_count_trigger ON tribe_post_comments;
CREATE TRIGGER tribe_post_comments_count_trigger
  AFTER INSERT OR DELETE ON tribe_post_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_post_counts();

-- Insert sample tribes data
INSERT INTO tribes (id, name, slug, description, cover_img, member_count, created_by) VALUES
  ('tribe-italian-smart-casual', 'Italian Smart Casual', 'italian-smart-casual', 'Een tribe voor liefhebbers van tijdloze Italiaanse elegantie, met een relaxte touch.', 'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=1200&h=400&dpr=2', 128, (SELECT id FROM auth.users LIMIT 1)),
  ('tribe-streetstyle-europe', 'Streetstyle Europe', 'streetstyle-europe', 'Voor de trendsetters en urban style liefhebbers die streetwear naar een hoger niveau tillen.', 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=1200&h=400&dpr=2', 256, (SELECT id FROM auth.users LIMIT 1)),
  ('tribe-minimalist-collective', 'Minimalist Collective', 'minimalist-collective', 'Voor liefhebbers van clean lines, neutrale kleuren en tijdloze elegantie.', 'https://images.pexels.com/photos/5935748/pexels-photo-5935748.jpeg?auto=compress&cs=tinysrgb&w=1200&h=400&dpr=2', 342, (SELECT id FROM auth.users LIMIT 1))
ON CONFLICT (id) DO NOTHING;