/**
 * Tribe Service Layer
 * Orchestrates between Supabase and localStorage fallback
 */

import { supabase } from '@/lib/supabase';
import { DATA_CONFIG } from '@/config/dataConfig';
import type { TribeMember, TribePost, Tribe } from '@/services/data/types';
import { 
  lt_getMembers, 
  lt_setMembers, 
  lt_joinTribe, 
  lt_leaveTribe, 
  lt_getPosts, 
  lt_addPost,
  lt_togglePostLike 
} from '@/services/data/localTribeStore';

/**
 * Get tribe members with fallback to localStorage
 */
export async function getTribeMembers(tribeId: string): Promise<TribeMember[]> {
  if (DATA_CONFIG.USE_SUPABASE) {
    try {
      const { data, error } = await supabase
        .from('tribe_members')
        .select(`
          *,
          user_profile:profiles!tribe_members_user_id_fkey(full_name, avatar_url)
        `)
        .eq('tribe_id', tribeId);

      if (error) throw error;
      
      // Convert to our TribeMember format
      return (data || []).map(member => ({
        id: member.id,
        tribe_id: member.tribe_id,
        user_id: member.user_id,
        role: member.role,
        joined_at: member.joined_at,
        user_profile: member.user_profile
      }));
    } catch (error) {
      console.warn('[TribeService] Supabase members failed, using localStorage:', error);
      return lt_getMembers(tribeId);
    }
  }
  
  return lt_getMembers(tribeId);
}

/**
 * Join tribe with fallback to localStorage
 */
export async function joinTribe(tribeId: string, userId: string): Promise<TribeMember> {
  if (DATA_CONFIG.USE_SUPABASE) {
    try {
      const { data, error } = await supabase
        .from('tribe_members')
        .insert({
          tribe_id: tribeId,
          user_id: userId,
          role: 'member'
        })
        .select()
        .single();

      if (error) {
        // Handle duplicate membership gracefully
        if (error.code === '23505') {
          console.log('[TribeService] User already member, returning existing membership');
          const existing = await getTribeMembers(tribeId);
          const existingMember = existing.find(m => m.user_id === userId);
          if (existingMember) return existingMember;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.warn('[TribeService] Supabase join failed, using localStorage:', error);
      
      // Fallback to localStorage
      const success = lt_joinTribe(tribeId, userId);
      if (!success) {
        throw new Error('Already a member');
      }
      
      return {
        id: `local_${Date.now()}`,
        tribe_id: tribeId,
        user_id: userId,
        role: 'member',
        joined_at: new Date().toISOString()
      };
    }
  }
  
  // Direct localStorage usage
  const success = lt_joinTribe(tribeId, userId);
  if (!success) {
    throw new Error('Already a member');
  }
  
  return {
    id: `local_${Date.now()}`,
    tribe_id: tribeId,
    user_id: userId,
    role: 'member',
    joined_at: new Date().toISOString()
  };
}

/**
 * Leave tribe with fallback to localStorage
 */
export async function leaveTribe(tribeId: string, userId: string): Promise<void> {
  if (DATA_CONFIG.USE_SUPABASE) {
    try {
      const { error } = await supabase
        .from('tribe_members')
        .delete()
        .eq('tribe_id', tribeId)
        .eq('user_id', userId);

      if (error) throw error;
      return;
    } catch (error) {
      console.warn('[TribeService] Supabase leave failed, using localStorage:', error);
      lt_leaveTribe(tribeId, userId);
      return;
    }
  }
  
  lt_leaveTribe(tribeId, userId);
}

/**
 * Get tribe posts with fallback to localStorage
 */
export async function getTribePosts(tribeId: string, options?: {
  limit?: number;
  offset?: number;
}): Promise<TribePost[]> {
  if (DATA_CONFIG.USE_SUPABASE) {
    try {
      let query = supabase
        .from('tribe_posts')
        .select(`
          *,
          user_profile:profiles!tribe_posts_user_id_fkey(full_name, avatar_url),
          outfit:outfits(id, title, image_url, match_percentage)
        `)
        .eq('tribe_id', tribeId)
        .order('created_at', { ascending: false });

      if (options?.limit) {
        query = query.limit(options.limit);
      }
      
      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.warn('[TribeService] Supabase posts failed, using localStorage:', error);
      return lt_getPosts(tribeId);
    }
  }
  
  return lt_getPosts(tribeId);
}

/**
 * Create tribe post with fallback to localStorage
 */
export async function createTribePost(post: Omit<TribePost, 'id' | 'created_at' | 'likes_count' | 'comments_count'>): Promise<TribePost> {
  if (DATA_CONFIG.USE_SUPABASE) {
    try {
      const { data, error } = await supabase
        .from('tribe_posts')
        .insert({
          tribe_id: post.tribe_id,
          user_id: post.user_id,
          content: post.content,
          image_url: post.image_url,
          outfit_id: post.outfit_id
        })
        .select(`
          *,
          user_profile:profiles!tribe_posts_user_id_fkey(full_name, avatar_url),
          outfit:outfits(id, title, image_url, match_percentage)
        `)
        .single();

      if (error) throw error;
      
      return data;
    } catch (error) {
      console.warn('[TribeService] Supabase post creation failed, using localStorage:', error);
      
      // Fallback to localStorage
      return lt_addPost({
        tribe_id: post.tribe_id,
        user_id: post.user_id,
        content: post.content,
        image_url: post.image_url,
        outfit_id: post.outfit_id
      });
    }
  }
  
  // Direct localStorage usage
  return lt_addPost({
    tribe_id: post.tribe_id,
    user_id: post.user_id,
    content: post.content,
    image_url: post.image_url,
    outfit_id: post.outfit_id
  });
}

/**
 * Toggle post like with fallback to localStorage
 */
export async function togglePostLike(postId: string, tribeId: string, userId: string): Promise<{
  liked: boolean;
  newCount: number;
}> {
  if (DATA_CONFIG.USE_SUPABASE) {
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
        
        // Get updated count
        const { count } = await supabase
          .from('tribe_post_likes')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', postId);

        return { liked: false, newCount: count || 0 };
      } else {
        // Like
        const { error } = await supabase
          .from('tribe_post_likes')
          .insert({
            post_id: postId,
            user_id: userId
          });

        if (error) throw error;
        
        // Get updated count
        const { count } = await supabase
          .from('tribe_post_likes')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', postId);

        return { liked: true, newCount: count || 1 };
      }
    } catch (error) {
      console.warn('[TribeService] Supabase like failed, using localStorage:', error);
      return lt_togglePostLike(postId, tribeId, userId);
    }
  }
  
  return lt_togglePostLike(postId, tribeId, userId);
}

/**
 * Health check for tribe service
 */
export async function checkTribeServiceHealth(): Promise<{
  supabase: boolean;
  localStorage: boolean;
  tablesExist: boolean;
}> {
  const result = {
    supabase: false,
    localStorage: true, // localStorage is always available
    tablesExist: false
  };

  if (DATA_CONFIG.USE_SUPABASE) {
    try {
      // Test Supabase connection
      const { error } = await supabase
        .from('tribes')
        .select('id')
        .limit(1);

      result.supabase = !error;
      result.tablesExist = !error;
    } catch (error) {
      console.warn('[TribeService] Supabase health check failed:', error);
    }
  }

  return result;
}