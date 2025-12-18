import { supabase } from '@/lib/supabase';

/**
 * Blog Service
 * Handles all blog-related database operations
 */

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author_name: string;
  author_bio: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  category: string;
  tags: string[];
  featured_image_url: string;
  read_time_minutes: number;
  status: 'draft' | 'review' | 'published' | 'archived';
  seo_meta_title: string;
  seo_meta_description: string;
  seo_focus_keyword: string;
  ai_generated: boolean;
  ai_model: string;
  view_count: number;
  engagement_score: number;
  featured: boolean;
}

export interface BlogTopic {
  id: string;
  topic: string;
  suggested_keywords: string[];
  target_audience: string;
  priority_score: number;
  status: 'pending' | 'in_progress' | 'completed';
  created_at: string;
  generated_post_id: string | null;
}

export interface BlogAnalyticsEvent {
  id: string;
  post_id: string;
  event_type: string;
  user_id: string | null;
  session_id: string;
  created_at: string;
}

export interface CreateBlogPostInput {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author_name?: string;
  author_bio?: string;
  category: string;
  tags?: string[];
  featured_image_url?: string;
  read_time_minutes?: number;
  status?: 'draft' | 'review' | 'published' | 'archived';
  seo_meta_title?: string;
  seo_meta_description?: string;
  seo_focus_keyword?: string;
  ai_generated?: boolean;
  ai_model?: string;
  featured?: boolean;
}

export interface UpdateBlogPostInput extends Partial<CreateBlogPostInput> {
  id: string;
}

export interface BlogPostFilters {
  status?: 'draft' | 'review' | 'published' | 'archived';
  category?: string;
  ai_generated?: boolean;
  featured?: boolean;
}

/**
 * Blog Posts Management
 */

export async function getAllBlogPosts(filters?: BlogPostFilters): Promise<BlogPost[]> {
  let query = supabase
    .from('blog_posts')
    .select('*')
    .order('updated_at', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.category) {
    query = query.eq('category', filters.category);
  }

  if (filters?.ai_generated !== undefined) {
    query = query.eq('ai_generated', filters.ai_generated);
  }

  if (filters?.featured !== undefined) {
    query = query.eq('featured', filters.featured);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch blog posts: ${error.message}`);
  }

  return data || [];
}

// Simplified interface matching what the RPC function returns
export interface PublishedBlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  author_name: string;
  published_at: string;
  category: string;
  tags: string[];
  featured_image_url: string;
  read_time_minutes: number;
  view_count: number;
  featured: boolean;
}

export async function getPublishedBlogPosts(
  pageSize: number = 10,
  pageOffset: number = 0,
  category?: string
): Promise<PublishedBlogPost[]> {
  const { data, error } = await supabase.rpc('get_published_blog_posts', {
    page_size: pageSize,
    page_offset: pageOffset,
    filter_category: category || null
  });

  if (error) {
    throw new Error(`Failed to fetch published posts: ${error.message}`);
  }

  return data || [];
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const { data, error } = await supabase.rpc('get_blog_post_by_slug', {
    post_slug: slug
  });

  if (error) {
    throw new Error(`Failed to fetch blog post: ${error.message}`);
  }

  return data?.[0] || null;
}

export async function getBlogPostById(id: string): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch blog post: ${error.message}`);
  }

  return data;
}

export async function createBlogPost(input: CreateBlogPostInput): Promise<BlogPost> {
  const { data, error } = await supabase
    .from('blog_posts')
    .insert([{
      ...input,
      author_name: input.author_name || 'FitFi Redactie',
      status: input.status || 'draft',
      tags: input.tags || [],
      read_time_minutes: input.read_time_minutes || estimateReadTime(input.content),
      ai_generated: input.ai_generated || false,
      featured: input.featured || false
    }])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create blog post: ${error.message}`);
  }

  return data;
}

export async function updateBlogPost(input: UpdateBlogPostInput): Promise<BlogPost> {
  const { id, ...updates } = input;

  // Auto-update read time if content changed
  if (updates.content) {
    updates.read_time_minutes = estimateReadTime(updates.content);
  }

  // Auto-set published_at when status changes to published
  if (updates.status === 'published' && !updates.published_at) {
    updates.published_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('blog_posts')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update blog post: ${error.message}`);
  }

  return data;
}

export async function deleteBlogPost(id: string): Promise<void> {
  const { error } = await supabase
    .from('blog_posts')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete blog post: ${error.message}`);
  }
}

export async function publishBlogPost(id: string): Promise<BlogPost> {
  return updateBlogPost({
    id,
    status: 'published',
    published_at: new Date().toISOString()
  });
}

export async function unpublishBlogPost(id: string): Promise<BlogPost> {
  return updateBlogPost({
    id,
    status: 'draft',
    published_at: null
  });
}

/**
 * Topics Management
 */

export async function getAllTopics(status?: BlogTopic['status']): Promise<BlogTopic[]> {
  let query = supabase
    .from('blog_topics')
    .select('*')
    .order('priority_score', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch topics: ${error.message}`);
  }

  return data || [];
}

export async function createTopic(
  topic: string,
  keywords: string[],
  targetAudience: string = 'algemeen',
  priorityScore: number = 5
): Promise<BlogTopic> {
  const { data, error } = await supabase
    .from('blog_topics')
    .insert([{
      topic,
      suggested_keywords: keywords,
      target_audience: targetAudience,
      priority_score: priorityScore,
      status: 'pending'
    }])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create topic: ${error.message}`);
  }

  return data;
}

export async function updateTopicStatus(
  id: string,
  status: BlogTopic['status'],
  generatedPostId?: string
): Promise<BlogTopic> {
  const updates: any = { status };
  if (generatedPostId) {
    updates.generated_post_id = generatedPostId;
  }

  const { data, error } = await supabase
    .from('blog_topics')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update topic: ${error.message}`);
  }

  return data;
}

export async function deleteTopic(id: string): Promise<void> {
  const { error } = await supabase
    .from('blog_topics')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete topic: ${error.message}`);
  }
}

/**
 * Analytics
 */

export async function trackBlogEvent(
  postId: string,
  eventType: string,
  userId?: string,
  sessionId?: string
): Promise<void> {
  const { error } = await supabase
    .from('blog_analytics')
    .insert([{
      post_id: postId,
      event_type: eventType,
      user_id: userId || null,
      session_id: sessionId || generateSessionId()
    }]);

  if (error) {
    console.error('Failed to track blog event:', error);
  }
}

export async function incrementViewCount(slug: string): Promise<void> {
  const { error } = await supabase.rpc('increment_blog_view_count', {
    post_slug: slug
  });

  if (error) {
    console.error('Failed to increment view count:', error);
  }
}

export async function getBlogAnalytics(postId: string) {
  const { data, error } = await supabase
    .from('blog_analytics')
    .select('event_type, created_at')
    .eq('post_id', postId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch analytics: ${error.message}`);
  }

  const events = data || [];

  // Aggregate analytics
  const analytics = {
    total_views: events.filter(e => e.event_type === 'view').length,
    total_shares: events.filter(e => e.event_type === 'share').length,
    total_cta_clicks: events.filter(e => e.event_type === 'cta_click').length,
    recent_events: events.slice(0, 10)
  };

  return analytics;
}

export async function getDashboardMetrics() {
  // Get all posts
  const { data: posts, error: postsError } = await supabase
    .from('blog_posts')
    .select('status, view_count, ai_generated');

  if (postsError) {
    throw new Error(`Failed to fetch dashboard metrics: ${postsError.message}`);
  }

  const allPosts = posts || [];

  // Get analytics events from last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: recentEvents, error: eventsError } = await supabase
    .from('blog_analytics')
    .select('event_type')
    .gte('created_at', thirtyDaysAgo.toISOString());

  if (eventsError) {
    throw new Error(`Failed to fetch analytics: ${eventsError.message}`);
  }

  const events = recentEvents || [];

  return {
    total_posts: allPosts.length,
    published_posts: allPosts.filter(p => p.status === 'published').length,
    draft_posts: allPosts.filter(p => p.status === 'draft').length,
    ai_generated_posts: allPosts.filter(p => p.ai_generated).length,
    total_views: allPosts.reduce((sum, p) => sum + p.view_count, 0),
    recent_views: events.filter(e => e.event_type === 'view').length,
    recent_shares: events.filter(e => e.event_type === 'share').length,
    recent_cta_clicks: events.filter(e => e.event_type === 'cta_click').length
  };
}

/**
 * Utility Functions
 */

function estimateReadTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function validateSlug(slug: string): boolean {
  return /^[a-z0-9-]+$/.test(slug);
}

/**
 * Transform database BlogPost to UI-friendly format
 */
export interface UIBlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  image: string;
  date: string;
  featured: boolean;
  author: {
    name: string;
    avatar: string;
    bio?: string;
  };
}

export function transformBlogPostForUI(post: PublishedBlogPost | BlogPost): UIBlogPost {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    content: 'content' in post ? post.content : '',
    category: post.category,
    tags: post.tags,
    image: post.featured_image_url || '/images/fallbacks/default.jpg',
    date: formatDateForUI(post.published_at || ('created_at' in post ? post.created_at : post.published_at)),
    featured: post.featured,
    author: {
      name: post.author_name || 'FitFi Redactie',
      avatar: generateAuthorAvatar(post.author_name),
      bio: 'author_bio' in post ? post.author_bio : undefined
    }
  };
}

function formatDateForUI(dateString: string): string {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  return date.toLocaleDateString('nl-NL', options);
}

function generateAuthorAvatar(authorName?: string): string {
  // Generate a consistent avatar URL based on author name
  const name = authorName || 'FitFi';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=128`;
}
