import { supabase } from '../lib/supabase';
import { Tribe, TribePost, TribeMember, CreateTribeData, CreatePostData, TribePostComment, FeatureFlag } from '../types/tribes';

export class TribesService {
  /**
   * Get feature flag status
   */
  static async getFeatureFlag(flagName: string): Promise<FeatureFlag | null> {
    try {
      const { data, error } = await supabase
        .from('remote_flags')
        .select('*')
        .eq('flag_name', flagName)
        .single();

      if (error) {
        console.warn(`Feature flag ${flagName} not found:`, error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching feature flag:', error);
      return null;
    }
  }

  /**
   * Check if style tribes feature is enabled
   */
  static async isStyleTribesEnabled(): Promise<boolean> {
    const flag = await this.getFeatureFlag('style_tribes');
    return Boolean(flag?.enabled && (flag?.percentage ?? 0) >= 100);
  }

  /**
   * Get all tribes with membership info
   */
  static async getTribes(userId?: string): Promise<Tribe[]> {
    try {
      let query = supabase
        .from('tribes')
        .select('*')
        .order('member_count', { ascending: false });

      const { data: tribes, error } = await query;

      if (error) throw error;

      if (!userId) return tribes || [];

      // Get user memberships
      const { data: memberships } = await supabase
        .from('tribe_members')
        .select('tribe_id, role')
        .eq('user_id', userId);

      // Enrich tribes with membership info
      const enrichedTribes = (tribes || []).map(tribe => {
        const membership = memberships?.find(m => m.tribe_id === tribe.id);
        return {
          ...tribe,
          is_member: !!membership,
          user_role: membership?.role
        };
      });

      return enrichedTribes;
    } catch (error) {
      console.error('Error fetching tribes:', error);
      return [];
    }
  }

  /**
   * Get tribe by slug
   */
  static async getTribeBySlug(slug: string, userId?: string): Promise<Tribe | null> {
    try {
      const { data: tribe, error } = await supabase
        .from('tribes')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) throw error;

      if (!userId) return tribe;

      // Check user membership
      const { data: membership } = await supabase
        .from('tribe_members')
        .select('role')
        .eq('tribe_id', tribe.id)
        .eq('user_id', userId)
        .single();

      return {
        ...tribe,
        is_member: !!membership,
        user_role: membership?.role
      };
    } catch (error) {
      console.error('Error fetching tribe:', error);
      return null;
    }
  }

  /**
   * Create a new tribe
   */
  static async createTribe(tribeData: CreateTribeData, userId: string): Promise<Tribe | null> {
    try {
      const { data: tribe, error } = await supabase
        .from('tribes')
        .insert({
          ...tribeData,
          created_by: userId
        })
        .select()
        .single();

      if (error) throw error;

      // Auto-join creator as owner
      await supabase
        .from('tribe_members')
        .insert({
          tribe_id: tribe.id,
          user_id: userId,
          role: 'owner'
        });

      return tribe;
    } catch (error) {
      console.error('Error creating tribe:', error);
      return null;
    }
  }

  /**
   * Join a tribe
   */
  static async joinTribe(tribeId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('tribe_members')
        .insert({
          tribe_id: tribeId,
          user_id: userId,
          role: 'member'
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error joining tribe:', error);
      return false;
    }
  }

  /**
   * Leave a tribe
   */
  static async leaveTribe(tribeId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('tribe_members')
        .delete()
        .eq('tribe_id', tribeId)
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error leaving tribe:', error);
      return false;
    }
  }

  /**
   * Get tribe posts with pagination
   */
  static async getTribePosts(
    tribeId: string, 
    page: number = 0, 
    limit: number = 10,
    userId?: string
  ): Promise<TribePost[]> {
    try {
      const offset = page * limit;

      const { data: posts, error } = await supabase
        .from('tribe_posts')
        .select(`
          *,
          user_profile:profiles!tribe_posts_user_id_fkey(full_name, avatar_url),
          outfit:outfits(id, title, image_url, match_percentage)
        `)
        .eq('tribe_id', tribeId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      if (!userId) return posts || [];

      // Get user likes for these posts
      const postIds = (posts || []).map(p => p.id);
      const { data: likes } = await supabase
        .from('tribe_post_likes')
        .select('post_id')
        .eq('user_id', userId)
        .in('post_id', postIds);

      const likedPostIds = new Set(likes?.map(l => l.post_id) || []);

      // Get recent comments for each post
      const { data: comments } = await supabase
        .from('tribe_post_comments')
        .select(`
          *,
          user_profile:profiles!tribe_post_comments_user_id_fkey(full_name, avatar_url)
        `)
        .in('post_id', postIds)
        .order('created_at', { ascending: false })
        .limit(3);

      // Group comments by post
      const commentsByPost = (comments || []).reduce((acc, comment) => {
        if (!acc[comment.post_id]) acc[comment.post_id] = [];
        acc[comment.post_id].push(comment);
        return acc;
      }, {} as Record<string, TribePostComment[]>);

      // Enrich posts with like status and recent comments
      const enrichedPosts = (posts || []).map(post => ({
        ...post,
        is_liked: likedPostIds.has(post.id),
        recent_comments: commentsByPost[post.id] || []
      }));

      return enrichedPosts;
    } catch (error) {
      console.error('Error fetching tribe posts:', error);
      return [];
    }
  }

  /**
   * Create a new post
   */
  static async createPost(postData: CreatePostData, userId: string): Promise<TribePost | null> {
    try {
      const { data: post, error } = await supabase
        .from('tribe_posts')
        .insert({
          ...postData,
          user_id: userId
        })
        .select(`
          *,
          user_profile:profiles!tribe_posts_user_id_fkey(full_name, avatar_url),
          outfit:outfits(id, title, image_url, match_percentage)
        `)
        .single();

      if (error) throw error;
      return post;
    } catch (error) {
      console.error('Error creating post:', error);
      return null;
    }
  }

  /**
   * Like/unlike a post
   */
  static async togglePostLike(postId: string, userId: string): Promise<boolean> {
    try {
      // Check if already liked
      const { data: existingLike } = await supabase
        .from('tribe_post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single();

      if (existingLike) {
        // Unlike
        const { error } = await supabase
          .from('tribe_post_likes')
          .delete()
          .eq('id', existingLike.id);

        if (error) throw error;
        return false; // Unliked
      } else {
        // Like
        const { error } = await supabase
          .from('tribe_post_likes')
          .insert({
            post_id: postId,
            user_id: userId
          });

        if (error) throw error;
        return true; // Liked
      }
    } catch (error) {
      console.error('Error toggling post like:', error);
      return false;
    }
  }

  /**
   * Add comment to post
   */
  static async addComment(postId: string, content: string, userId: string): Promise<TribePostComment | null> {
    try {
      const { data: comment, error } = await supabase
        .from('tribe_post_comments')
        .insert({
          post_id: postId,
          user_id: userId,
          content
        })
        .select(`
          *,
          user_profile:profiles!tribe_post_comments_user_id_fkey(full_name, avatar_url)
        `)
        .single();

      if (error) throw error;
      return comment;
    } catch (error) {
      console.error('Error adding comment:', error);
      return null;
    }
  }

  /**
   * Get tribe members
   */
  static async getTribeMembers(tribeId: string): Promise<TribeMember[]> {
    try {
      const { data: members, error } = await supabase
        .from('tribe_members')
        .select(`
          *,
          user_profile:profiles!tribe_members_user_id_fkey(full_name, avatar_url)
        `)
        .eq('tribe_id', tribeId)
        .order('joined_at', { ascending: false });

      if (error) throw error;
      return members || [];
    } catch (error) {
      console.error('Error fetching tribe members:', error);
      return [];
    }
  }
}

