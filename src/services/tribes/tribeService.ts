/**
 * Tribe Service Layer
 * Orchestrates between Supabase and localStorage fallback
 */

import { supabase } from '@/lib/supabaseClient';
import { withTimeout } from '@/lib/net/withTimeout';
import { withRetry } from '@/lib/net/withRetry';
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

// Configuration from environment
const TIMEOUT_MS = Number(import.meta.env.VITE_SUPABASE_HEALTHCHECK_TIMEOUT_MS || 3500);
const MAX_ATTEMPTS = Number(import.meta.env.VITE_SUPABASE_RETRY_MAX_ATTEMPTS || 3);
const BASE_DELAY = Number(import.meta.env.VITE_SUPABASE_RETRY_BASE_MS || 400);

/**
 * Execute Supabase operation with timeout and retry for tribes
 */
async function executeTribesOperation<T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> {
  const runner = async () => {
    const sb = supabase();
    if (!sb) throw new Error('Supabase client not available');
    return await operation();
  };
  
  return await withTimeout(
    withRetry(runner, MAX_ATTEMPTS, BASE_DELAY),
    TIMEOUT_MS,
    operationName
  );
}

/**
 * Get tribe members with fallback to localStorage
 */
export async function getTribeMembers(tribeId: string): Promise<TribeMember[]> {
  if (DATA_CONFIG.USE_SUPABASE) {
    try {
      const data = await sb_getTribeMembers(tribeId);
      
      if (data && data.length >= 0) {
        return data;
      }
      
      // Fallback to localStorage if no data
      console.log('[TribeService] No Supabase data, using localStorage fallback');
      return lt_getMembers(tribeId);
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
      const data = await sb_joinTribe(tribeId, userId);
      
      if (data) {
        return data;
      }
      
      // If no data returned, try localStorage fallback
      console.log('[TribeService] No Supabase response, using localStorage fallback');
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
    } catch (error) {
      // Handle specific errors
      if ((error as any)?.message?.includes('Already a member')) {
        throw error; // Re-throw membership errors
      }
      
      console.warn('[TribeService] Supabase join failed, using localStorage:', error);
      
      // Fallback to localStorage for network errors
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
  
  // Direct localStorage usage when Supabase disabled
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
      await sb_leaveTribe(tribeId, userId);
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
      const data = await sb_getTribePosts(tribeId, options);
      
      if (data && data.length >= 0) {
        return data;
      }
      
      // Fallback to localStorage if no data
      console.log('[TribeService] No Supabase posts, using localStorage fallback');
      return lt_getPosts(tribeId);
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
      const data = await sb_createTribePost(post);
      
      if (data) {
        return data;
      }
      
      // Fallback to localStorage if no data returned
      console.log('[TribeService] No Supabase response, using localStorage fallback');
      return lt_addPost(post);
    } catch (error) {
      console.warn('[TribeService] Supabase post creation failed, using localStorage:', error);
      
      // Fallback to localStorage
      return lt_addPost(post);
    }
  }
  
  // Direct localStorage usage
  return lt_addPost(post);
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
      const sb = supabase();
      if (!sb) throw new Error('Supabase client not available');
      
      // Check if already liked
      const { data: existingLike } = await sb
        .from('tribe_post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single();

      if (existingLike) {
        // Unlike
        const { error } = await sb
          .from('tribe_post_likes')
          .delete()
          .eq('id', existingLike.id);

        if (error) throw error;
        
        // Get updated count
        const { count } = await sb
          .from('tribe_post_likes')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', postId);

        return { liked: false, newCount: count || 0 };
      } else {
        // Like
        const { error } = await sb
          .from('tribe_post_likes')
          .insert({
            post_id: postId,
            user_id: userId
          });

        if (error) throw error;
        
        // Get updated count
        const { count } = await sb
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
      const { error } = await supabase()
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