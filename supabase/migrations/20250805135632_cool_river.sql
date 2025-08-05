/*
  # Style Tribes Community System

  1. New Tables
    - `remote_flags` - Feature flag system
    - `tribes` - Style communities  
    - `tribe_members` - Membership with roles
    - `tribe_posts` - User posts with outfits
    - `tribe_post_likes` - Like system
    - `tribe_post_comments` - Comment system

  2. Security
    - RLS enabled on all tables
    - Role-based permissions
    - Public read for discovery
*/

-- Feature flags
CREATE TABLE IF NOT EXISTS remote_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_name text UNIQUE NOT NULL,
  enabled boolean DEFAULT false,
  percentage integer DEFAULT 0,
  config jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Tribes
CREATE TABLE IF NOT EXISTS tribes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text NOT NULL,
  cover_img text,
  member_count integer DEFAULT 0,
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Tribe members
CREATE TABLE IF NOT EXISTS tribe_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tribe_id uuid REFERENCES tribes(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'owner')),
  joined_at timestamptz DEFAULT now(),
  UNIQUE(tribe_id, user_id)
);

-- Tribe posts
CREATE TABLE IF NOT EXISTS tribe_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tribe_id uuid REFERENCES tribes(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  outfit_id uuid REFERENCES outfits(id) ON DELETE SET NULL,
  content text NOT NULL,
  image_url text,
  likes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Post likes
CREATE TABLE IF NOT EXISTS tribe_post_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES tribe_posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Post comments
CREATE TABLE IF NOT EXISTS tribe_post_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES tribe_posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE remote_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE tribes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tribe_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tribe_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tribe_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tribe_post_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public read flags" ON remote_flags FOR SELECT TO public USING (true);
CREATE POLICY "Public read tribes" ON tribes FOR SELECT TO public USING (true);
CREATE POLICY "Users create tribes" ON tribes FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Owners update tribes" ON tribes FOR UPDATE TO authenticated USING (auth.uid() = created_by);

CREATE POLICY "Public read members" ON tribe_members FOR SELECT TO public USING (true);
CREATE POLICY "Users join tribes" ON tribe_members FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users leave tribes" ON tribe_members FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Public read posts" ON tribe_posts FOR SELECT TO public USING (true);
CREATE POLICY "Members create posts" ON tribe_posts FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM tribe_members WHERE tribe_id = tribe_posts.tribe_id AND user_id = auth.uid()));

CREATE POLICY "Public read likes" ON tribe_post_likes FOR SELECT TO public USING (true);
CREATE POLICY "Users like posts" ON tribe_post_likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users unlike posts" ON tribe_post_likes FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Public read comments" ON tribe_post_comments FOR SELECT TO public USING (true);
CREATE POLICY "Users comment" ON tribe_post_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Insert feature flag
INSERT INTO remote_flags (flag_name, enabled, percentage) VALUES ('style_tribes', true, 100) ON CONFLICT (flag_name) DO UPDATE SET enabled = true, percentage = 100;

-- Insert sample tribes
INSERT INTO tribes (name, slug, description, created_by) VALUES 
('Minimalist Style', 'minimalist-style', 'Voor liefhebbers van clean en simpele looks', (SELECT id FROM auth.users LIMIT 1)),
('Vintage Lovers', 'vintage-lovers', 'Retro en vintage fashion community', (SELECT id FROM auth.users LIMIT 1)),
('Streetwear Culture', 'streetwear-culture', 'Urban streetwear en sneaker culture', (SELECT id FROM auth.users LIMIT 1))
ON CONFLICT (slug) DO NOTHING;