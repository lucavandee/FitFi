import { useMemo, useCallback } from 'react';
import { DATA_CONFIG } from "@/config/dataConfig";
import { loadLocalJSON } from "@/utils/loadLocalJSON";
import { getSupabase } from '@/lib/supabase';
import type { BoltProduct, Outfit, FitFiUserProfile, Tribe, DataResponse } from "./types";

/**
 * Cache for data service operations
 */
const cache = new Map<string, { data: any; timestamp: number; source: 'supabase' | 'local' | 'fallback' }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get cached data if still valid
 */
function getCachedData<T>(key: string): { data: T; source: 'supabase' | 'local' | 'fallback'; cached: true } | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return {
      data: cached.data,
      source: cached.source,
      cached: true
    };
  }
  return null;
}

/**
 * Set cache data
 */
function setCachedData(key: string, data: any, source: 'supabase' | 'local' | 'fallback'): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    source
  });
}

/**
 * Fetch products with fallback chain
 */
export async function fetchProducts(options?: {
  gender?: 'male' | 'female' | 'unisex';
  category?: string;
  archetype?: string;
  limit?: number;
  enhanceAffiliate?: boolean;
}): Promise<DataResponse<BoltProduct[]>> {
  const cacheKey = `products_${JSON.stringify(options || {})}`;
  
  // Check cache first
  const cached = getCachedData<BoltProduct[]>(cacheKey);
  if (cached) {
    return cached;
  }

  const errors: string[] = [];

  // Try Supabase first if enabled
  if (DATA_CONFIG.USE_SUPABASE) {
    try {
      const sb = getSupabase();
      if (sb) {
        let query = sb.from(DATA_CONFIG.SUPABASE.tables.products).select("*");
        
        if (options?.gender) {
          query = query.eq('gender', options.gender);
        }
        if (options?.category) {
          query = query.eq('category', options.category);
        }
        if (options?.limit) {
          query = query.limit(options.limit);
        }
        
        const { data, error } = await query;
        
        if (!error && data) {
          const result = { data: data as BoltProduct[], source: 'supabase' as const, cached: false };
          setCachedData(cacheKey, data, 'supabase');
          return result;
        } else {
          errors.push(`Supabase: ${error?.message || 'Unknown error'}`);
        }
      }
    } catch (error) {
      errors.push(`Supabase: ${error instanceof Error ? error.message : 'Connection failed'}`);
    }
  }

  // Fallback to local JSON
  try {
    const localData = await loadLocalJSON<BoltProduct[]>(DATA_CONFIG.LOCAL_JSON.products);
    
    if (Array.isArray(localData) && localData.length > 0) {
      let filtered = localData;
      
      // Apply filters
      if (options?.gender) {
        filtered = filtered.filter(p => p.gender === options.gender);
      }
      if (options?.category) {
        filtered = filtered.filter(p => p.category === options.category);
      }
      if (options?.limit) {
        filtered = filtered.slice(0, options.limit);
      }
      
      const result = { data: filtered, source: 'local' as const, cached: false };
      setCachedData(cacheKey, filtered, 'local');
      return result;
    }
  } catch (error) {
    errors.push(`Local JSON: ${error instanceof Error ? error.message : 'Load failed'}`);
  }

  // Final fallback
  const fallbackData: BoltProduct[] = [];
  const result = { data: fallbackData, source: 'fallback' as const, cached: false, errors };
  setCachedData(cacheKey, fallbackData, 'fallback');
  return result;
}

/**
 * Fetch outfits with fallback chain
 */
export async function fetchOutfits(options?: {
  archetype?: string;
  season?: string;
  limit?: number;
}): Promise<DataResponse<Outfit[]>> {
  const cacheKey = `outfits_${JSON.stringify(options || {})}`;
  
  // Check cache first
  const cached = getCachedData<Outfit[]>(cacheKey);
  if (cached) {
    return cached;
  }

  const errors: string[] = [];

  // Try Supabase first if enabled
  if (DATA_CONFIG.USE_SUPABASE) {
    try {
      const sb = getSupabase();
      if (sb) {
        let query = sb.from(DATA_CONFIG.SUPABASE.tables.outfits).select("*");
        
        if (options?.archetype) {
          query = query.contains('tags', [options.archetype]);
        }
        if (options?.limit) {
          query = query.limit(options.limit);
        }
        
        const { data, error } = await query;
        
        if (!error && data) {
          const result = { data: data as Outfit[], source: 'supabase' as const, cached: false };
          setCachedData(cacheKey, data, 'supabase');
          return result;
        } else {
          errors.push(`Supabase: ${error?.message || 'Unknown error'}`);
        }
      }
    } catch (error) {
      errors.push(`Supabase: ${error instanceof Error ? error.message : 'Connection failed'}`);
    }
  }

  // Fallback to local JSON
  try {
    const localData = await loadLocalJSON<Outfit[]>(DATA_CONFIG.LOCAL_JSON.outfits);
    
    if (Array.isArray(localData)) {
      let filtered = localData;
      
      // Apply filters
      if (options?.archetype) {
        filtered = filtered.filter(o => o.tags?.includes(options.archetype!));
      }
      if (options?.limit) {
        filtered = filtered.slice(0, options.limit);
      }
      
      const result = { data: filtered, source: 'local' as const, cached: false };
      setCachedData(cacheKey, filtered, 'local');
      return result;
    }
  } catch (error) {
    errors.push(`Local JSON: ${error instanceof Error ? error.message : 'Load failed'}`);
  }

  // Final fallback
  const fallbackData: Outfit[] = [];
  const result = { data: fallbackData, source: 'fallback' as const, cached: false, errors };
  setCachedData(cacheKey, fallbackData, 'fallback');
  return result;
}

/**
 * Fetch user with fallback chain
 */
export async function fetchUser(userId: string): Promise<DataResponse<FitFiUserProfile | null>> {
  const cacheKey = `user_${userId}`;
  
  // Check cache first
  const cached = getCachedData<FitFiUserProfile | null>(cacheKey);
  if (cached) {
    return cached;
  }

  const errors: string[] = [];

  // Try Supabase first if enabled
  if (DATA_CONFIG.USE_SUPABASE) {
    try {
      const sb = getSupabase();
      if (sb) {
        const { data, error } = await sb
          .from(DATA_CONFIG.SUPABASE.tables.users)
          .select("*")
          .eq('id', userId)
          .single();
        
        if (!error && data) {
          const result = { data: data as FitFiUserProfile, source: 'supabase' as const, cached: false };
          setCachedData(cacheKey, data, 'supabase');
          return result;
        } else {
          errors.push(`Supabase: ${error?.message || 'User not found'}`);
        }
      }
    } catch (error) {
      errors.push(`Supabase: ${error instanceof Error ? error.message : 'Connection failed'}`);
    }
  }

  // Fallback to local JSON
  try {
    const localData = await loadLocalJSON<FitFiUserProfile>(DATA_CONFIG.LOCAL_JSON.user);
    
    if (localData && localData.id === userId) {
      const result = { data: localData, source: 'local' as const, cached: false };
      setCachedData(cacheKey, localData, 'local');
      return result;
    }
  } catch (error) {
    errors.push(`Local JSON: ${error instanceof Error ? error.message : 'Load failed'}`);
  }

  // Final fallback
  const result = { data: null, source: 'fallback' as const, cached: false, errors };
  setCachedData(cacheKey, null, 'fallback');
  return result;
}

/**
 * Fetch tribes with fallback chain
 */
export async function fetchTribes(options?: {
  featured?: boolean;
  archetype?: string;
  limit?: number;
}): Promise<DataResponse<Tribe[]>> {
  const cacheKey = `tribes_${JSON.stringify(options || {})}`;
  
  // Check cache first
  const cached = getCachedData<Tribe[]>(cacheKey);
  if (cached) {
    return cached;
  }

  const errors: string[] = [];

  // Try Supabase first if enabled
  if (DATA_CONFIG.USE_SUPABASE) {
    try {
      const sb = getSupabase();
      if (sb) {
        let query = sb.from(DATA_CONFIG.SUPABASE.tables.tribes).select("*");
        
        if (options?.featured !== undefined) {
          query = query.eq('featured', options.featured);
        }
        if (options?.archetype) {
          query = query.eq('archetype', options.archetype);
        }
        if (options?.limit) {
          query = query.limit(options.limit);
        }
        
        const { data, error } = await query;
        
        if (!error && data) {
          const result = { data: data as Tribe[], source: 'supabase' as const, cached: false };
          setCachedData(cacheKey, data, 'supabase');
          return result;
        } else {
          errors.push(`Supabase: ${error?.message || 'Unknown error'}`);
        }
      }
    } catch (error) {
      errors.push(`Supabase: ${error instanceof Error ? error.message : 'Connection failed'}`);
    }
  }

  // Fallback to local JSON
  try {
    const localData = await loadLocalJSON<Tribe[]>(DATA_CONFIG.LOCAL_JSON.tribes);
    
    if (Array.isArray(localData)) {
      let filtered = localData;
      
      // Apply filters
      if (options?.featured !== undefined) {
        filtered = filtered.filter(t => t.featured === options.featured);
      }
      if (options?.archetype) {
        filtered = filtered.filter(t => t.archetype === options.archetype);
      }
      if (options?.limit) {
        filtered = filtered.slice(0, options.limit);
      }
      
      const result = { data: filtered, source: 'local' as const, cached: false };
      setCachedData(cacheKey, filtered, 'local');
      return result;
    }
  } catch (error) {
    errors.push(`Local JSON: ${error instanceof Error ? error.message : 'Load failed'}`);
  }

  // Final fallback
  const fallbackData: Tribe[] = [];
  const result = { data: fallbackData, source: 'fallback' as const, cached: false, errors };
  setCachedData(cacheKey, fallbackData, 'fallback');
  return result;
}

/**
 * Fetch tribe by slug with fallback chain
 */
export async function fetchTribeBySlug(slug: string, userId?: string): Promise<DataResponse<Tribe | null>> {
  const cacheKey = `tribe_${slug}_${userId || 'anon'}`;
  
  // Check cache first
  const cached = getCachedData<Tribe | null>(cacheKey);
  if (cached) {
    return cached;
  }

  const errors: string[] = [];

  // Try Supabase first if enabled
  if (DATA_CONFIG.USE_SUPABASE) {
    try {
      const sb = getSupabase();
      if (sb) {
        const { data: tribe, error } = await sb
          .from(DATA_CONFIG.SUPABASE.tables.tribes)
          .select("*")
          .eq('slug', slug)
          .single();
        
        if (!error && tribe) {
          // Check membership if userId provided
          let tribeWithMembership = tribe;
          if (userId) {
            try {
              const { data: membership } = await sb
                .from(DATA_CONFIG.SUPABASE.tables.tribeMembers)
                .select('role')
                .eq('tribe_id', tribe.id)
                .eq('user_id', userId)
                .single();

              tribeWithMembership = {
                ...tribe,
                is_member: !!membership,
                user_role: membership?.role
              };
            } catch (membershipError) {
              // Ignore membership check errors
            }
          }
          
          const result = { data: tribeWithMembership as Tribe, source: 'supabase' as const, cached: false };
          setCachedData(cacheKey, tribeWithMembership, 'supabase');
          return result;
        } else {
          errors.push(`Supabase: ${error?.message || 'Tribe not found'}`);
        }
      }
    } catch (error) {
      errors.push(`Supabase: ${error instanceof Error ? error.message : 'Connection failed'}`);
    }
  }

  // Fallback to local JSON
  try {
    const localData = await loadLocalJSON<Tribe[]>(DATA_CONFIG.LOCAL_JSON.tribes);
    
    if (Array.isArray(localData)) {
      const tribe = localData.find(t => t.slug === slug);
      
      if (tribe) {
        const result = { data: tribe, source: 'local' as const, cached: false };
        setCachedData(cacheKey, tribe, 'local');
        return result;
      }
    }
  } catch (error) {
    errors.push(`Local JSON: ${error instanceof Error ? error.message : 'Load failed'}`);
  }

  // Final fallback
  const result = { data: null, source: 'fallback' as const, cached: false, errors };
  setCachedData(cacheKey, null, 'fallback');
  return result;
}

/**
 * Clear cache
 */
export function clearCache(): void {
  cache.clear();
  console.log('[DataService] Cache cleared');
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { hits: number; misses: number; size: number } {
  return {
    hits: 0, // Would need to track this
    misses: 0, // Would need to track this
    size: cache.size
  };
}

/**
 * Get recent errors
 */
export function getRecentErrors(): any[] {
  return []; // Would need to implement error tracking
}

/**
 * Health check
 */
export async function healthCheck(): Promise<{ ok: boolean; source: string; responseTime: number }> {
  const startTime = Date.now();
  
  if (DATA_CONFIG.USE_SUPABASE) {
    try {
      const sb = getSupabase();
      if (sb) {
        const { error } = await sb.from('users').select('id').limit(1);
        const responseTime = Date.now() - startTime;
        
        if (!error) {
          return { ok: true, source: 'supabase', responseTime };
        }
      }
    } catch (error) {
      // Fall through to local check
    }
  }
  
  // Check local JSON availability
  try {
    await loadLocalJSON<any[]>(DATA_CONFIG.LOCAL_JSON.products);
    const responseTime = Date.now() - startTime;
    return { ok: true, source: 'local', responseTime };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    return { ok: false, source: 'fallback', responseTime };
  }
}

// Basic shape; pas desgewenst aan aan je bestaande types
export type QuizAnswer = any;

/**
 * Haal één quiz-antwoord op voor een user+step.
 * - Supabase: selecteert uit 'quiz_answers' met velden user_id, question_id, answer, updated_at
 * - Fallback: leest localStorage key `quiz:${userId}:${stepId}`
 */
export async function getQuizAnswer(userId: string, stepId: string): Promise<QuizAnswer | null> {
  try {
    const sb = getSupabase();
    if (!sb) {
      // Fallback (client only)
      if (typeof window !== 'undefined') {
        const raw = window.localStorage.getItem(`quiz:${userId}:${stepId}`);
        return raw ? JSON.parse(raw) : null;
      }
      return null;
    }

    const { data, error } = await sb
      .from('quiz_answers')
      .select('*')
      .eq('user_id', userId)
      .eq('question_id', stepId)
      .maybeSingle();

    if (error) {
      // Log zacht en val terug op null
      console.debug('[quiz:getQuizAnswer] supabase error', error);
      return null;
    }
    return data ?? null;
  } catch (e) {
    console.debug('[quiz:getQuizAnswer] exception', e);
    return null;
  }
}