/*
  # AI Blog System - Database Setup

  ## Overview
  Complete database infrastructure voor AI-gegenereerde blog content met admin workflow,
  SEO optimalisatie, en analytics tracking.

  ## New Tables

  ### 1. `blog_posts`
  Hoofdtabel voor alle blog content (AI-gegenereerd + handmatig)
  - `id` (uuid, primary key)
  - `slug` (text, unique) - SEO-friendly URL
  - `title` (text) - Blog titel
  - `excerpt` (text) - Korte samenvatting (~160 chars voor meta)
  - `content` (text) - Volledige content in Markdown
  - `author_name` (text) - Auteursnaam
  - `author_bio` (text) - Korte bio voor auteur section
  - `published_at` (timestamptz, nullable) - Null = draft status
  - `created_at` (timestamptz) - Aanmaak timestamp
  - `updated_at` (timestamptz) - Laatste wijziging
  - `category` (text) - Categorie (Stijltips, Kleuradvies, etc.)
  - `tags` (text[]) - SEO keywords als array
  - `featured_image_url` (text) - Hoofd afbeelding URL
  - `read_time_minutes` (int) - Geschatte leestijd
  - `status` (text) - draft/review/published/archived
  - `seo_meta_title` (text) - Custom SEO title
  - `seo_meta_description` (text) - Custom meta description
  - `seo_focus_keyword` (text) - Primaire keyword voor SEO
  - `ai_generated` (boolean) - Tracking of content AI-made is
  - `ai_model` (text) - Welk AI model gebruikt (bijv. "claude-3.5-sonnet")
  - `view_count` (int) - Aantal keer bekeken
  - `engagement_score` (float) - AI-calculated relevance score
  - `featured` (boolean) - Featured post op homepage

  ### 2. `blog_topics`
  Queue systeem voor AI-gegenereerde topic ideeën
  - `id` (uuid, primary key)
  - `topic` (text) - Topic beschrijving
  - `suggested_keywords` (text[]) - Keywords voor SEO
  - `target_audience` (text) - Doelgroep beschrijving
  - `priority_score` (int) - 1-10 prioriteit
  - `status` (text) - pending/in_progress/completed
  - `created_at` (timestamptz)
  - `generated_post_id` (uuid, nullable) - Link naar uiteindelijke post

  ### 3. `blog_analytics`
  Event tracking voor blog engagement
  - `id` (uuid, primary key)
  - `post_id` (uuid, foreign key) - Link naar blog_posts
  - `event_type` (text) - 'view', 'share', 'cta_click', etc.
  - `user_id` (uuid, nullable) - User indien ingelogd
  - `session_id` (text) - Anonymous session tracking
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS op alle tabellen
  - Public read access voor published blog posts
  - Admin-only write access (using is_admin boolean)
  - Analytics: public write (voor tracking), admin read

  ## Performance
  - Index op slug (unique, voor URL lookups)
  - Index op published_at (voor chronologische sorting)
  - Index op category (voor filtering)
  - Index op status + published_at (voor admin dashboard)
  - Index op post_id in analytics (voor aggregaties)
*/

-- ============================================================================
-- Table: blog_posts
-- ============================================================================

CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  excerpt text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  author_name text NOT NULL DEFAULT 'FitFi Redactie',
  author_bio text DEFAULT '',
  published_at timestamptz DEFAULT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  category text NOT NULL DEFAULT 'Stijltips',
  tags text[] DEFAULT ARRAY[]::text[],
  featured_image_url text DEFAULT '',
  read_time_minutes int DEFAULT 5,
  status text DEFAULT 'draft' NOT NULL CHECK (status IN ('draft', 'review', 'published', 'archived')),
  seo_meta_title text DEFAULT '',
  seo_meta_description text DEFAULT '',
  seo_focus_keyword text DEFAULT '',
  ai_generated boolean DEFAULT true,
  ai_model text DEFAULT '',
  view_count int DEFAULT 0,
  engagement_score float DEFAULT 0.0,
  featured boolean DEFAULT false
);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_blog_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS blog_posts_updated_at ON blog_posts;
CREATE TRIGGER blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_blog_posts_updated_at();

-- ============================================================================
-- Table: blog_topics
-- ============================================================================

CREATE TABLE IF NOT EXISTS blog_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic text NOT NULL,
  suggested_keywords text[] DEFAULT ARRAY[]::text[],
  target_audience text DEFAULT 'algemeen',
  priority_score int DEFAULT 5 CHECK (priority_score >= 1 AND priority_score <= 10),
  status text DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed')),
  created_at timestamptz DEFAULT now() NOT NULL,
  generated_post_id uuid REFERENCES blog_posts(id) ON DELETE SET NULL
);

-- ============================================================================
-- Table: blog_analytics
-- ============================================================================

CREATE TABLE IF NOT EXISTS blog_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id text DEFAULT '',
  created_at timestamptz DEFAULT now() NOT NULL
);

-- ============================================================================
-- Indexes for Performance
-- ============================================================================

-- blog_posts indexes
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status_published ON blog_posts(status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_featured ON blog_posts(featured) WHERE featured = true;

-- blog_topics indexes
CREATE INDEX IF NOT EXISTS idx_blog_topics_status ON blog_topics(status);
CREATE INDEX IF NOT EXISTS idx_blog_topics_priority ON blog_topics(priority_score DESC);

-- blog_analytics indexes
CREATE INDEX IF NOT EXISTS idx_blog_analytics_post_id ON blog_analytics(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_analytics_created_at ON blog_analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_analytics_event_type ON blog_analytics(event_type);

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_analytics ENABLE ROW LEVEL SECURITY;

-- blog_posts policies
CREATE POLICY "Anyone can view published blog posts"
  ON blog_posts
  FOR SELECT
  USING (status = 'published' AND published_at IS NOT NULL);

CREATE POLICY "Admins can view all blog posts"
  ON blog_posts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can insert blog posts"
  ON blog_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update blog posts"
  ON blog_posts
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can delete blog posts"
  ON blog_posts
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- blog_topics policies (admin-only)
CREATE POLICY "Admins can view all blog topics"
  ON blog_topics
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can insert blog topics"
  ON blog_topics
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update blog topics"
  ON blog_topics
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can delete blog topics"
  ON blog_topics
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- blog_analytics policies (public write for tracking, admin read)
CREATE POLICY "Anyone can insert analytics events"
  ON blog_analytics
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all analytics"
  ON blog_analytics
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- ============================================================================
-- Helper Functions
-- ============================================================================

-- Function: Increment view count
CREATE OR REPLACE FUNCTION increment_blog_view_count(post_slug text)
RETURNS void AS $$
BEGIN
  UPDATE blog_posts
  SET view_count = view_count + 1
  WHERE slug = post_slug AND status = 'published';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get published posts with pagination
CREATE OR REPLACE FUNCTION get_published_blog_posts(
  page_size int DEFAULT 10,
  page_offset int DEFAULT 0,
  filter_category text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  slug text,
  title text,
  excerpt text,
  author_name text,
  published_at timestamptz,
  category text,
  tags text[],
  featured_image_url text,
  read_time_minutes int,
  view_count int,
  featured boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    bp.id,
    bp.slug,
    bp.title,
    bp.excerpt,
    bp.author_name,
    bp.published_at,
    bp.category,
    bp.tags,
    bp.featured_image_url,
    bp.read_time_minutes,
    bp.view_count,
    bp.featured
  FROM blog_posts bp
  WHERE bp.status = 'published'
    AND bp.published_at IS NOT NULL
    AND (filter_category IS NULL OR bp.category = filter_category)
  ORDER BY bp.published_at DESC
  LIMIT page_size
  OFFSET page_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get blog post by slug
CREATE OR REPLACE FUNCTION get_blog_post_by_slug(post_slug text)
RETURNS TABLE (
  id uuid,
  slug text,
  title text,
  excerpt text,
  content text,
  author_name text,
  author_bio text,
  published_at timestamptz,
  category text,
  tags text[],
  featured_image_url text,
  read_time_minutes int,
  seo_meta_title text,
  seo_meta_description text,
  view_count int
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    bp.id,
    bp.slug,
    bp.title,
    bp.excerpt,
    bp.content,
    bp.author_name,
    bp.author_bio,
    bp.published_at,
    bp.category,
    bp.tags,
    bp.featured_image_url,
    bp.read_time_minutes,
    bp.seo_meta_title,
    bp.seo_meta_description,
    bp.view_count
  FROM blog_posts bp
  WHERE bp.slug = post_slug
    AND bp.status = 'published'
    AND bp.published_at IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
