// src/services/data/supabaseSource.ts
import { supabase } from "@/lib/supabaseClient";
import { withTimeout } from "@/lib/net/withTimeout";
import { withRetry } from "@/lib/net/withRetry";
import { DATA_CONFIG } from "@/config/dataConfig";
import type { BoltProduct, Outfit, FitFiUserProfile, TribeMember, TribePost, Tribe } from "./types";
import type { TribeChallenge, TribeChallengeSubmission, TribeRanking } from "./types";

// Configuration from environment
const TIMEOUT_MS = Number(import.meta.env.VITE_SUPABASE_HEALTHCHECK_TIMEOUT_MS || 3500);
const MAX_ATTEMPTS = Number(import.meta.env.VITE_SUPABASE_RETRY_MAX_ATTEMPTS || 3);
const BASE_DELAY = Number(import.meta.env.VITE_SUPABASE_RETRY_BASE_MS || 400);

/**
 * Get Supabase client from singleton
 */
function getClient() {
  const client = supabase();
  if (!client) {
    console.warn("[SupabaseSource] Client not available - check environment variables");
  }
  return client;
}

/**
 * Validate UUID format for user operations
 */
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Enhanced error handling with context
 */
function handleSupabaseError(error: any, operation: string, table?: string): never {
  const context = table ? `${operation} on ${table}` : operation;
  console.error(`[SupabaseSource] ${context} failed:`, error);
  
  // Enhance error message with context
  const enhancedError = new Error(`Supabase ${context}: ${error.message}`);
  (enhancedError as any).originalError = error;
  (enhancedError as any).operation = operation;
  (enhancedError as any).table = table;
  
  throw enhancedError;
}

/**
 * Execute Supabase operation with timeout and retry
 */
async function executeSupabaseOperation<T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> {
  const runner = async () => {
    const sb = getClient();
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
 * Execute Supabase operation with enhanced error handling
 */
async function executeSupabaseOperationSafe<T>(
  operation: () => Promise<{ data: T; error: any }>,
  operationName: string,
  tableName?: string
): Promise<T> {
  try {
    const result = await executeTribesOperation(operation, operationName);
    
    if (result.error) {
      handleSupabaseError(result.error, operationName, tableName);
    }
    
    return result.data;
  } catch (error) {
    console.error(`[SupabaseSource] ${operationName} failed:`, error);
    throw error;
  }
}

/**
 * Get products from Supabase with enhanced error handling
 */
export async function getSbProducts(filters?: {
  gender?: "male" | "female" | "unisex";
  category?: string;
  limit?: number;
}): Promise<BoltProduct[] | null> {
  const sb = getClient();
  if (!sb) return null;
  
  try {
    const { data, error } = await executeSupabaseOperation(async () => {
      let query = sb.from(DATA_CONFIG.SUPABASE.tables.products).select("*");
      
      // Apply filters if provided
      if (filters?.gender) {
        query = query.eq('gender', filters.gender);
      }
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }
      
      return await query;
    }, 'fetch_products');
    
    if (error) {
      handleSupabaseError(error, 'select', 'products');
    }
    
    // Validate and transform data
    const products = (data ?? []) as any[];
    const validProducts = products.filter(product => 
      product && 
      typeof product === 'object' && 
      product.id && 
      product.title
    );
    
    if (validProducts.length !== products.length) {
      console.warn(`[SupabaseSource] Filtered out ${products.length - validProducts.length} invalid products`);
    }
    
    console.log(`[SupabaseSource] Loaded ${validProducts.length} products`);
    return validProducts as BoltProduct[];
  } catch (error) {
    console.error('[SupabaseSource] Products fetch failed:', error);
    throw error;
  }
}

/**
 * Get outfits from Supabase with enhanced error handling
 */
export async function getSbOutfits(filters?: {
  archetype?: string;
  season?: "spring" | "summer" | "autumn" | "winter" | "all";
  limit?: number;
}): Promise<Outfit[] | null> {
  const sb = getClient();
  if (!sb) return null;
  
  try {
    const { data, error } = await executeSupabaseOperation(async () => {
      let query = sb.from(DATA_CONFIG.SUPABASE.tables.outfits).select("*");
      
      // Apply filters if provided
      if (filters?.archetype) {
        query = query.contains('archetypes', [filters.archetype]);
      }
      if (filters?.season) {
        query = query.eq('season', filters.season);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }
      
      return await query;
    }, 'fetch_outfits');
    
    if (error) {
      handleSupabaseError(error, 'select', 'outfits');
    }
    
    // Validate and transform data
    const outfits = (data ?? []) as any[];
    const validOutfits = outfits.filter(outfit => 
      outfit && 
      typeof outfit === 'object' && 
      outfit.id && 
      outfit.name
    );
    
    if (validOutfits.length !== outfits.length) {
      console.warn(`[SupabaseSource] Filtered out ${outfits.length - validOutfits.length} invalid outfits`);
    }
    
    console.log(`[SupabaseSource] Loaded ${validOutfits.length} outfits`);
    return validOutfits as Outfit[];
  } catch (error) {
    console.error('[SupabaseSource] Outfits fetch failed:', error);
    throw error;
  }
}

/**
 * Get user from Supabase with enhanced validation
 */
export async function getSbUser(userId: string): Promise<FitFiUserProfile | null> {
  const sb = getClient();
  if (!sb) return null;
  
  // Validate user ID format
  if (!isValidUUID(userId)) {
    console.warn('[SupabaseSource] Invalid user ID format:', userId);
    return null;
  }
  
  try {
    const { data, error } = await sb
      .from(DATA_CONFIG.SUPABASE.tables.users)
      .select("*")
      .eq("id", userId)
      .single();
    
    if (error) {
      // Handle "not found" gracefully
      if (error.code === 'PGRST116') {
        console.log(`[SupabaseSource] User ${userId} not found`);
        return null;
      }
      handleSupabaseError(error, 'select', 'users');
    }
    
    // Validate user data
    if (!data || !data.id) {
      console.warn('[SupabaseSource] Invalid user data received');
      return null;
    }
    
    console.log(`[SupabaseSource] Loaded user: ${data.id}`);
    return data as FitFiUserProfile;
  } catch (error) {
    console.error('[SupabaseSource] User fetch failed:', error);
    throw error;
  }
}

/**
 * Check Supabase connection health
 */
export async function checkSupabaseHealth(): Promise<{
  isHealthy: boolean;
  responseTime: number;
  error?: string;
}> {
  const startTime = Date.now();
  
  try {
    const sb = getClient();
    if (!sb) {
      return {
        isHealthy: false,
        responseTime: 0,
        error: 'Client not available'
      };
    }
    
    // Simple health check query
    const { error } = await sb
      .from('users')
      .select('id')
      .limit(1);
    
    const responseTime = Date.now() - startTime;
    
    if (error) {
      return {
        isHealthy: false,
        responseTime,
        error: error.message
      };
    }
    
    return {
      isHealthy: true,
      responseTime
    };
  } catch (error) {
    return {
      isHealthy: false,
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get Supabase connection info for debugging
 */
export function getSupabaseInfo(): {
  hasCredentials: boolean;
  url?: string;
  isConfigured: boolean;
} {
  const { url, anonKey } = DATA_CONFIG.SUPABASE;
  
  return {
    hasCredentials: !!(url && anonKey),
    url: url ? url.replace(/\/.*$/, '/***') : undefined, // Mask URL for security
    isConfigured: DATA_CONFIG.USE_SUPABASE
  };
}

/**
 * Get tribes from Supabase with enhanced error handling
 */
export async function getSbTribes(filters?: {
  featured?: boolean;
  archetype?: string;
  limit?: number;
}): Promise<Tribe[] | null> {
  const sb = getClient();
  if (!sb) return null;
  
  try {
    let query = sb.from(DATA_CONFIG.SUPABASE.tables.tribes).select("*");
    
    // Apply filters if provided
    if (filters?.featured !== undefined) {
      query = query.eq('featured', filters.featured);
    }
    if (filters?.archetype) {
      query = query.eq('archetype', filters.archetype);
    }
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    
    // Order by member count and activity
    query = query.order('member_count', { ascending: false });
    
    const { data, error } = await query;
    
    if (error) {
      handleSupabaseError(error, 'select', 'tribes');
    }
    
    // Validate and transform data
    const tribes = (data ?? []) as any[];
    const validTribes = tribes.filter(tribe => 
      tribe && 
      typeof tribe === 'object' && 
      tribe.id && 
      tribe.name &&
      tribe.slug
    );
    
    if (validTribes.length !== tribes.length) {
      console.warn(`[SupabaseSource] Filtered out ${tribes.length - validTribes.length} invalid tribes`);
    }
    
    console.log(`[SupabaseSource] Loaded ${validTribes.length} tribes`);
    return validTribes as Tribe[];
  } catch (error) {
    console.error('[SupabaseSource] Tribes fetch failed:', error);
    throw error;
  }
}

/**
 * Get tribe by slug from Supabase
 */
export async function getSbTribeBySlug(slug: string, userId?: string): Promise<Tribe | null> {
  const sb = getClient();
  if (!sb) return null;
  
  try {
    const { data: tribe, error } = await sb
      .from(DATA_CONFIG.SUPABASE.tables.tribes)
      .select("*")
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.log(`[SupabaseSource] Tribe ${slug} not found`);
        return null;
      }
      handleSupabaseError(error, 'select', 'tribes');
    }
    
    if (!tribe) return null;

    // Check user membership if userId provided
    if (userId && isValidUUID(userId)) {
      try {
        const { data: membership } = await sb
          .from(DATA_CONFIG.SUPABASE.tables.tribe_members)
          .select('role')
          .eq('tribe_id', tribe.id)
          .eq('user_id', userId)
          .single();

        return {
          ...tribe,
          is_member: !!membership,
          user_role: membership?.role
        } as Tribe;
      } catch (membershipError) {
        console.warn('[SupabaseSource] Could not check membership:', membershipError);
        return tribe as Tribe;
      }
    }

    return tribe as Tribe;
  } catch (error) {
    console.error('[SupabaseSource] Tribe by slug fetch failed:', error);
    throw error;
  }
}

/**
 * Get tribe posts from Supabase
 */
export async function getSbTribePosts(
  tribeId: string,
  options?: {
    limit?: number;
    offset?: number;
    userId?: string;
  }
): Promise<TribePost[] | null> {
  const sb = getClient();
  if (!sb) return null;
  
  try {
    const { limit = 10, offset = 0, userId } = options || {};
    
    let query = sb
      .from(DATA_CONFIG.SUPABASE.tables.tribe_posts)
      .select(`
        *,
        user_profile:profiles!tribe_posts_user_id_fkey(full_name, avatar_url),
        outfit:outfits(id, title, image_url, match_percentage)
      `)
      .eq('tribe_id', tribeId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: posts, error } = await query;

    if (error) {
      handleSupabaseError(error, 'select', 'tribe_posts');
    }

    if (!posts) return [];

    // Get user likes if userId provided
    if (userId && isValidUUID(userId)) {
      try {
        const postIds = posts.map(p => p.id);
        const { data: likes } = await sb
          .from(DATA_CONFIG.SUPABASE.tables.tribe_post_likes)
          .select('post_id')
          .eq('user_id', userId)
          .in('post_id', postIds);

        const likedPostIds = new Set(likes?.map(l => l.post_id) || []);

        // Enrich posts with like status
        return posts.map(post => ({
          ...post,
          is_liked_by_current_user: likedPostIds.has(post.id)
        })) as TribePost[];
      } catch (likesError) {
        console.warn('[SupabaseSource] Could not load likes:', likesError);
        return posts as TribePost[];
      }
    }

    return posts as TribePost[];
  } catch (error) {
    console.error('[SupabaseSource] Tribe posts fetch failed:', error);
    throw error;
  }
}

/**
 * TRIBES MEMBERS CRUD
 */

/**
 * Get tribe members from Supabase
 */
export async function sb_getTribeMembers(tribeId: string): Promise<TribeMember[] | null> {
  const sb = getClient();
  if (!sb) return null;
  
  try {
    const data = await executeSupabaseOperationSafe(async () => {
      return await sb
        .from('tribe_members')
        .select(`
          *,
          user_profile:profiles!tribe_members_user_id_fkey(full_name, avatar_url)
        `)
        .eq('tribe_id', tribeId);
    }, 'get_tribe_members', 'tribe_members');
    
    // Convert to our TribeMember format
    return (data || []).map((member: any) => ({
      id: member.id,
      tribe_id: member.tribe_id,
      user_id: member.user_id,
      role: member.role,
      joined_at: member.joined_at,
      user_profile: member.user_profile
    }));
  } catch (error) {
    console.warn('[SupabaseSource] Tribe members failed:', error);
    throw error;
  }
}

/**
 * Join a tribe via Supabase
 */
export async function sb_joinTribe(tribeId: string, userId: string): Promise<TribeMember | null> {
  const sb = getClient();
  if (!sb) return null;
  
  // Validate user ID format
  if (!isValidUUID(userId)) {
    console.warn('[SupabaseSource] Invalid user ID format for join:', userId);
    return null;
  }
  
  try {
    const data = await executeSupabaseOperationSafe(async () => {
      return await sb
        .from('tribe_members')
        .insert({
          tribe_id: tribeId,
          user_id: userId,
          role: 'member'
        })
        .select()
        .single();
    }, 'join_tribe', 'tribe_members');

    return data;
  } catch (error) {
    // Handle duplicate membership gracefully
    if ((error as any)?.code === '23505') {
      console.log('[SupabaseSource] User already member');
      throw new Error('Already a member');
    }
    console.error('[SupabaseSource] Tribe join failed:', error);
    throw error;
  }
}

/**
 * Leave a tribe via Supabase
 */
export async function sb_leaveTribe(tribeId: string, userId: string): Promise<void> {
  const sb = getClient();
  if (!sb) return;
  
  // Validate user ID format
  if (!isValidUUID(userId)) {
    console.warn('[SupabaseSource] Invalid user ID format for leave:', userId);
    return;
  }
  
  try {
    await executeSupabaseOperationSafe(async () => {
      return await sb
        .from('tribe_members')
        .delete()
        .eq('tribe_id', tribeId)
        .eq('user_id', userId);
    }, 'leave_tribe', 'tribe_members');
    
    console.log(`[SupabaseSource] User ${userId} left tribe ${tribeId}`);
  } catch (error) {
    console.error('[SupabaseSource] Tribe leave failed:', error);
    throw error;
  }
}

/**
 * TRIBES POSTS CRUD
 */

/**
 * Get tribe posts from Supabase
 */
export async function sb_getTribePosts(tribeId: string, options?: {
  limit?: number;
  offset?: number;
}): Promise<TribePost[] | null> {
  const sb = getClient();
  if (!sb) return null;
  
  try {
    const data = await executeSupabaseOperationSafe(async () => {
      let query = sb
        .from('tribe_posts')
        .select(`
          *,
          user_profile:profiles!tribe_posts_user_id_fkey(full_name, avatar_url),
          outfit:outfits(id, title, image_url, match_percentage)
        `)
        .eq('tribe_id', tribeId)
        .order('created_at', { ascending: false });
      
      // Apply pagination if provided
      if (options?.limit) {
        query = query.limit(options.limit);
      }
      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }
      
      return await query;
    }, 'get_tribe_posts', 'tribe_posts');
    
    console.log(`[SupabaseSource] Loaded ${(data || []).length} tribe posts for ${tribeId}`);
    return (data || []) as TribePost[];
  } catch (error) {
    console.error('[SupabaseSource] Tribe posts fetch failed:', error);
    throw error;
  }
}

/**
 * Create a new tribe post via Supabase
 */
export async function sb_createTribePost(post: Omit<TribePost, 'id' | 'createdAt'>): Promise<TribePost | null> {
  const sb = getClient();
  if (!sb) return null;
  
  // Validate user ID format
  if (!isValidUUID(post.user_id || '')) {
    console.warn('[SupabaseSource] Invalid user ID format for post:', post.user_id);
    return null;
  }
  
  try {
    const data = await executeSupabaseOperationSafe(async () => {
      return await sb
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
    }, 'create_tribe_post', 'tribe_posts');
    
    console.log(`[SupabaseSource] Created tribe post: ${data.id}`);
    return data as TribePost;
  } catch (error) {
    console.error('[SupabaseSource] Tribe post creation failed:', error);
    throw error;
  }
}

/**
 * Update tribe post (for likes, comments count, etc.)
 */
export async function sb_updateTribePost(
  postId: string, 
  updates: Partial<Pick<TribePost, 'likes_count' | 'comments_count'>>
): Promise<TribePost | null> {
  const sb = getClient();
  if (!sb) return null;
  
  try {
    const data = await executeSupabaseOperationSafe(async () => {
      return await sb
        .from('tribe_posts')
        .update(updates)
        .eq('id', postId)
        .select('*')
        .single();
    }, 'update_tribe_post', 'tribe_posts');
    
    console.log(`[SupabaseSource] Updated tribe post: ${postId}`);
    return data as TribePost;
  } catch (error) {
    console.error('[SupabaseSource] Tribe post update failed:', error);
    throw error;
  }
}

/**
 * Delete tribe post via Supabase
 */
export async function sb_deleteTribePost(postId: string, authorId: string): Promise<void> {
  const sb = getClient();
  if (!sb) return;
  
  // Validate user ID format
  if (!isValidUUID(authorId)) {
    console.warn('[SupabaseSource] Invalid author ID format for delete:', authorId);
    return;
  }
  
  try {
    await executeSupabaseOperationSafe(async () => {
      return await sb
        .from('tribe_posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', authorId); // Only author can delete their own posts
    }, 'delete_tribe_post', 'tribe_posts');
    
    console.log(`[SupabaseSource] Deleted tribe post: ${postId}`);
  } catch (error) {
    console.error('[SupabaseSource] Tribe post deletion failed:', error);
    throw error;
  }
}

/**
 * TRIBE CHALLENGES CRUD
 */

/**
 * Get tribe challenges from Supabase
 */
export async function getSbTribeChallenges(
  tribeId: string,
  options?: {
    status?: "draft" | "open" | "closed" | "archived";
    limit?: number;
  }
): Promise<TribeChallenge[] | null> {
  const sb = getClient();
  if (!sb) return null;
  
  try {
    let query = sb
      .from('tribe_challenges')
      .select('*')
      .eq('tribe_id', tribeId)
      .order('created_at', { ascending: false });
    
    // Apply filters
    if (options?.status) {
      query = query.eq('status', options.status);
    }
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    
    const data = await executeSupabaseOperationSafe(
      () => query,
      'get_tribe_challenges',
      'tribe_challenges'
    );
    
    console.log(`[SupabaseSource] Loaded ${(data || []).length} challenges for tribe ${tribeId}`);
    return (data || []) as TribeChallenge[];
  } catch (error) {
    console.error('[SupabaseSource] Tribe challenges fetch failed:', error);
    throw error;
  }
}

/**
 * Get challenge submissions from Supabase
 */
export async function getSbChallengeSubmissions(
  challengeId: string,
  options?: {
    userId?: string;
    limit?: number;
  }
): Promise<TribeChallengeSubmission[] | null> {
  const sb = getClient();
  if (!sb) return null;
  
  try {
    let query = sb
      .from('tribe_challenge_submissions')
      .select(`
        *,
        user_profile:profiles!tribe_challenge_submissions_user_id_fkey(full_name, avatar_url)
      `)
      .eq('challenge_id', challengeId)
      .order('created_at', { ascending: false });
    
    // Apply filters
    if (options?.userId) {
      query = query.eq('user_id', options.userId);
    }
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    
    const data = await executeSupabaseOperationSafe(
      () => query,
      'get_challenge_submissions',
      'tribe_challenge_submissions'
    );
    
    console.log(`[SupabaseSource] Loaded ${(data || []).length} submissions for challenge ${challengeId}`);
    return (data || []) as TribeChallengeSubmission[];
  } catch (error) {
    console.error('[SupabaseSource] Challenge submissions fetch failed:', error);
    throw error;
  }
}

/**
 * Create challenge submission via Supabase
 */
export async function createSbChallengeSubmission(
  submission: Omit<TribeChallengeSubmission, 'id' | 'createdAt'>
): Promise<TribeChallengeSubmission | null> {
  const sb = getClient();
  if (!sb) return null;
  
  // Validate user ID format
  if (!isValidUUID(submission.userId)) {
    console.warn('[SupabaseSource] Invalid user ID format for submission:', submission.userId);
    return null;
  }
  
  try {
    const data = await executeSupabaseOperationSafe(async () => {
      return await sb
        .from('tribe_challenge_submissions')
        .insert({
          tribe_id: submission.tribeId,
          challenge_id: submission.challengeId,
          user_id: submission.userId,
          content: submission.content,
          image_url: submission.imageUrl,
          link_url: submission.linkUrl
        })
        .select(`
          *,
          user_profile:profiles!tribe_challenge_submissions_user_id_fkey(full_name, avatar_url)
        `)
        .single();
    }, 'create_challenge_submission', 'tribe_challenge_submissions');
    
    console.log(`[SupabaseSource] Created challenge submission: ${data.id}`);
    return data as TribeChallengeSubmission;
  } catch (error) {
    console.error('[SupabaseSource] Challenge submission creation failed:', error);
    throw error;
  }
}

/**
 * Get tribe rankings from Supabase
 */
export async function getSbTribeRankings(
  options?: {
    limit?: number;
    userId?: string;
    tribeId?: string;
  }
): Promise<TribeRanking[] | null> {
  const sb = getClient();
  if (!sb) return null;
  
  try {
    let query = sb
      .from('tribe_rankings')
      .select('*')
      .order('points', { ascending: false });
    
    // Apply filters
    if (options?.tribeId) {
      query = query.eq('tribe_id', options.tribeId);
    }
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    
    const data = await executeSupabaseOperationSafe(
      async () => await query,
      'get_tribe_rankings',
      'tribe_rankings'
    );
    
    // Add rank numbers
    const rankedData = (data || []).map((ranking: any, index: number) => ({
      ...ranking,
      rank: index + 1
    }));
    
    console.log(`[SupabaseSource] Loaded ${rankedData.length} tribe rankings`);
    return rankedData as TribeRanking[];
  } catch (error) {
    console.error('[SupabaseSource] Tribe rankings fetch failed:', error);
    throw error;
  }
}

/**
 * Clear local cache (for development)
 */
export function clearSupabaseCache(): void {
  // Note: This clears the local JSON cache, not Supabase cache
  // Supabase doesn't have client-side caching in this implementation
  console.log('[SupabaseSource] Cache cleared (no client-side cache for Supabase)');
}