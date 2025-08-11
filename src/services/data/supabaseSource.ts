// src/services/data/supabaseSource.ts
import { createClient } from "@supabase/supabase-js";
import { DATA_CONFIG } from "@/config/dataConfig";
import type { BoltProduct, Outfit, FitFiUserProfile } from "./types";

/**
 * Safe Supabase client creation with environment validation
 */
function getClient() {
  const { url, anonKey } = DATA_CONFIG.SUPABASE;
  if (!url || !anonKey) {
    console.warn('[SupabaseSource] Missing credentials, client not available');
    return null;
  }
  
  try {
    return createClient(url, anonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      global: {
        headers: {
          'X-Client-Info': 'fitfi-data-service'
        }
      }
    });
  } catch (error) {
    console.error('[SupabaseSource] Client creation failed:', error);
    return null;
  }
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
    
    const { data, error } = await query;
    
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
    
    const { data, error } = await query;
    
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
 * Clear local cache (for development)
 */
export function clearSupabaseCache(): void {
  // Note: This clears the local JSON cache, not Supabase cache
  // Supabase doesn't have client-side caching in this implementation
  console.log('[SupabaseSource] Cache cleared (no client-side cache for Supabase)');
}