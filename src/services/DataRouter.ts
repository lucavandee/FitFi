import { APP_ENV, shouldUseSupabase } from '../config/env';
import { isHealthy } from '../lib/supabaseHealth';
import { UserProfile } from '../context/UserContext';
import { Outfit, Product, Season } from '../engine';
import { generateMockOutfits } from '@/utils/mockOutfits';
import { rankOutfits, ensureDiversity } from '@/engine/ranking';
import { fetchProducts } from '@/services/data/dataService';
import { generateMockProducts } from '../utils/mockDataUtils';
import { getSupabase } from '@/lib/supabase';
import { loadLocalJSON } from '@/utils/loadLocalJSON';

/**
 * Centralized data router with environment toggle and bulletproof fallback
 * Priority: Supabase (if healthy) → Local JSON → Mock data
 */

// Supabase source functions
const supabaseSource = {
  async getOutfits(query?: any): Promise<Outfit[]> {
    const sb = getSupabase();
    if (!sb) throw new Error('Supabase not available');
    
    let supabaseQuery = sb.from('outfits').select('*');
    
    if (query?.archetype) {
      supabaseQuery = supabaseQuery.contains('tags', [query.archetype]);
    }
    if (query?.limit) {
      supabaseQuery = supabaseQuery.limit(query.limit);
    }
    
    const { data, error } = await supabaseQuery;
    if (error) throw error;
    
    return (data || []) as Outfit[];
  },

  async getProducts(query?: any): Promise<Product[]> {
    const sb = getSupabase();
    if (!sb) throw new Error('Supabase not available');
    
    let supabaseQuery = sb.from('products').select('*');
    
    if (query?.gender) {
      supabaseQuery = supabaseQuery.eq('gender', query.gender);
    }
    if (query?.category) {
      supabaseQuery = supabaseQuery.eq('category', query.category);
    }
    if (query?.limit) {
      supabaseQuery = supabaseQuery.limit(query.limit);
    }
    
    const { data, error } = await supabaseQuery;
    if (error) throw error;
    
    return (data || []).map(p => ({
      id: p.id,
      name: p.name,
      imageUrl: p.image_url,
      type: p.type,
      category: p.category,
      styleTags: p.tags || [],
      description: p.description,
      price: p.price,
      brand: p.brand,
      affiliateUrl: p.product_url,
      season: ['autumn'], // Default season
      matchScore: 0.8
    }));
  },

  async getTribes(query?: any): Promise<any[]> {
    const sb = getSupabase();
    if (!sb) throw new Error('Supabase not available');
    
    let supabaseQuery = sb.from('tribes').select('*');
    
    if (query?.featured !== undefined) {
      supabaseQuery = supabaseQuery.eq('featured', query.featured);
    }
    if (query?.archetype) {
      supabaseQuery = supabaseQuery.eq('archetype', query.archetype);
    }
    if (query?.limit) {
      supabaseQuery = supabaseQuery.limit(query.limit);
    }
    
    const { data, error } = await supabaseQuery;
    if (error) throw error;
    
    return data || [];
  },

  async getDashboardStats(userId: string): Promise<any> {
    const sb = getSupabase();
    if (!sb) throw new Error('Supabase not available');
    
    const { data, error } = await sb
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    
    return data || {
      user_id: userId,
      level: 1,
      xp: 0,
      posts: 0,
      submissions: 0,
      wins: 0,
      invites: 0
    };
  }
};

// Local fallback functions
const localFallback = {
  async getOutfits(query?: any): Promise<Outfit[]> {
    try {
      const outfits = await loadLocalJSON<Outfit[]>('/data/bolt/outfits.json');
      
      if (!Array.isArray(outfits)) {
        console.warn('[DataRouter] Local outfits not an array, using mock');
        return generateMockOutfits(query?.limit || 12).map(o => ({
          id: o.id,
          name: o.title,
          description: o.description,
          image: o.imageUrl,
          tags: o.tags,
          archetype: o.archetype,
          season: 'autumn',
          occasions: ['casual'],
          items: o.products.map(p => ({
            id: p.id,
            name: p.name,
            brand: p.brand,
            price: p.price,
            imageUrl: p.imageUrl,
            affiliateUrl: '',
            category: p.category
          }))
        }));
      }
      
      let filtered = outfits;
      if (query?.archetype) {
        filtered = filtered.filter(o => o.tags?.includes(query.archetype));
      }
      if (query?.limit) {
        filtered = filtered.slice(0, query.limit);
      }
      
      return filtered;
    } catch (error) {
      console.warn('[DataRouter] Local outfits failed, using mock:', error);
      return generateMockOutfits(query?.limit || 12).map(o => ({
        id: o.id,
        name: o.title,
        description: o.description,
        image: o.imageUrl,
        tags: o.tags,
        archetype: o.archetype,
        season: 'autumn',
        occasions: ['casual'],
        items: []
      }));
    }
  },

  async getProducts(query?: any): Promise<Product[]> {
    try {
      const products = await loadLocalJSON<any[]>('/data/bolt/products.json');
      
      if (!Array.isArray(products)) {
        console.warn('[DataRouter] Local products not an array, using mock');
        return generateMockProducts(query?.category, query?.limit || 10);
      }
      
      let filtered = products;
      if (query?.gender) {
        filtered = filtered.filter(p => p.gender === query.gender);
      }
      if (query?.category) {
        filtered = filtered.filter(p => p.category === query.category);
      }
      if (query?.limit) {
        filtered = filtered.slice(0, query.limit);
      }
      
      return filtered.map(p => ({
        id: p.id,
        name: p.title || p.name,
        imageUrl: p.imageUrl,
        type: p.type,
        category: p.category || p.type,
        styleTags: p.styleTags || [],
        description: p.description || `${p.title || p.name} van ${p.brand || 'Unknown'}`,
        price: p.price,
        brand: p.brand,
        affiliateUrl: p.affiliateUrl,
        season: [p.season === 'all_season' ? 'autumn' : p.season || 'autumn'],
        matchScore: 0.8
      }));
    } catch (error) {
      console.warn('[DataRouter] Local products failed, using mock:', error);
      return generateMockProducts(query?.category, query?.limit || 10);
    }
  },

  async getTribes(query?: any): Promise<any[]> {
    try {
      const tribes = await loadLocalJSON<any[]>('/data/bolt/tribes.json');
      
      if (!Array.isArray(tribes)) {
        console.warn('[DataRouter] Local tribes not an array, using empty');
        return [];
      }
      
      let filtered = tribes;
      if (query?.featured !== undefined) {
        filtered = filtered.filter(t => t.featured === query.featured);
      }
      if (query?.archetype) {
        filtered = filtered.filter(t => t.archetype === query.archetype);
      }
      if (query?.limit) {
        filtered = filtered.slice(0, query.limit);
      }
      
      return filtered;
    } catch (error) {
      console.warn('[DataRouter] Local tribes failed:', error);
      return [];
    }
  },

  async getDashboardStats(userId: string): Promise<any> {
    // Return mock dashboard stats
    return {
      user_id: userId,
      level: 2,
      xp: 150,
      posts: 3,
      submissions: 1,
      wins: 0,
      invites: 1,
      last_active: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }
};

/**
 * Centralized data router with environment toggle and bulletproof fallback
 */
export async function getOutfits(query?: {
  archetype?: string;
  season?: string;
  limit?: number;
}): Promise<Outfit[]> {
  console.log('[🔍 DataRouter] getOutfits called with query:', query);
  
  // Try Supabase if enabled and healthy
  if (shouldUseSupabase() && isHealthy()) {
    try {
      const result = await supabaseSource.getOutfits(query);
      if (result && result.length > 0) {
        console.log(`[🧠 DataRouter] Returning ${result.length} outfits from Supabase`);
        return result;
      }
    } catch (error) {
      console.warn('[DataRouter] Supabase outfits failed, falling back:', error);
    }
  }
  
  // Fallback to local/mock
  const result = await localFallback.getOutfits(query);
  console.log(`[🧠 DataRouter] Returning ${result.length} outfits from local fallback`);
  return result;
}

/**
 * Gets recommended products for a user
 * @param userId - User ID
 * @param count - Number of products to recommend
 * @param season - Optional season to filter by
 * @returns Array of recommended products
 */
export async function getRecommendedProducts(
  user?: UserProfile,
  count: number = 9, 
  season?: Season
): Promise<Product[]> {
  console.log('[🔍 DataRouter] getRecommendedProducts called with user:', user?.id || 'anon', 'count:', count, 'season:', season);
  
  // Try Supabase if enabled and healthy
  if (shouldUseSupabase() && isHealthy()) {
    try {
      const result = await supabaseSource.getProducts({
        gender: user?.gender === 'male' ? 'male' : 'female',
        limit: count
      });
      
      if (result && result.length > 0) {
        console.log(`[🧠 DataRouter] Returning ${result.length} products from Supabase`);
        return result;
      }
    } catch (error) {
      console.warn('[DataRouter] Supabase products failed, falling back:', error);
    }
  }
  
  // Fallback to local/mock
  if (APP_ENV.USE_MOCK_DATA) {
    if (APP_ENV.DEBUG_MODE) {
      console.log("⚠️ Using mock products via USE_MOCK_DATA");
    }
    const mockProducts = generateMockProducts(undefined, count);
    if (APP_ENV.DEBUG_MODE) {
      console.log('[🔍 DataRouter] Returning mock products:', mockProducts);
    }
    return mockProducts;
  }
  
  try {
    const result = await localFallback.getProducts({
      gender: user?.gender === 'male' ? 'male' : 'female',
      limit: count
    });
    console.log(`[🧠 DataRouter] Returning ${result.length} products from local fallback`);
    return result;
  } catch (error) {
    console.error('[🧠 DataRouter] Error getting recommended products:', error);
    const mockProducts = generateMockProducts(undefined, count);
    console.log(`[🧠 DataRouter] Returning ${mockProducts.length} mock products as final fallback`);
    return mockProducts;
  }
}

/**
 * Get style archetypes with fallback
 */
export async function getArchetypes(): Promise<any[]> {
  console.log('[🔍 DataRouter] getArchetypes called');
  
  // Try Supabase if enabled and healthy
  if (shouldUseSupabase() && isHealthy()) {
    try {
      const sb = getSupabase();
      if (sb) {
        const { data, error } = await sb.from('style_archetypes').select('*');
        if (!error && data && data.length > 0) {
          console.log(`[🧠 DataRouter] Returning ${data.length} archetypes from Supabase`);
          return data;
        }
      }
    } catch (error) {
      console.warn('[DataRouter] Supabase archetypes failed, falling back:', error);
    }
  }
  
  // Fallback to local data
  try {
    const archetypes = await loadLocalJSON<any[]>('/data/archetypes.json');
    if (Array.isArray(archetypes)) {
      console.log(`[🧠 DataRouter] Returning ${archetypes.length} archetypes from local`);
      return archetypes;
    }
  } catch (error) {
    console.warn('[DataRouter] Local archetypes failed:', error);
  }
  
  // Final fallback - hardcoded archetypes
  const fallbackArchetypes = [
    { id: 'klassiek', name: 'Klassiek', description: 'Tijdloze elegantie' },
    { id: 'casual_chic', name: 'Casual Chic', description: 'Moeiteloos elegant' },
    { id: 'urban', name: 'Urban', description: 'Stoere stadslook' },
    { id: 'streetstyle', name: 'Streetstyle', description: 'Authentieke streetwear' },
    { id: 'retro', name: 'Retro', description: 'Vintage vibes' },
    { id: 'luxury', name: 'Luxury', description: 'Exclusieve stukken' }
  ];
  
  console.log(`[🧠 DataRouter] Returning ${fallbackArchetypes.length} hardcoded archetypes`);
  return fallbackArchetypes;
}

/**
 * Get user style profile with fallback
 */
export async function getStyleProfile(userId: string): Promise<any> {
  console.log('[🔍 DataRouter] getStyleProfile called for user:', userId);
  
  // Try Supabase if enabled and healthy
  if (shouldUseSupabase() && isHealthy()) {
    try {
      const sb = getSupabase();
      if (sb) {
        const { data, error } = await sb
          .from('style_preferences')
          .select('*')
          .eq('user_id', userId)
          .single();
        
        if (!error && data) {
          console.log(`[🧠 DataRouter] Returning style profile from Supabase`);
          return data;
        }
      }
    } catch (error) {
      console.warn('[DataRouter] Supabase style profile failed, falling back:', error);
    }
  }
  
  // Fallback to local storage or default
  try {
    const localProfile = localStorage.getItem(`fitfi.styleProfile.${userId}`);
    if (localProfile) {
      const parsed = JSON.parse(localProfile);
      console.log(`[🧠 DataRouter] Returning style profile from localStorage`);
      return parsed;
    }
  } catch (error) {
    console.warn('[DataRouter] Local style profile failed:', error);
  }
  
  // Final fallback - default profile
  const defaultProfile = {
    user_id: userId,
    casual: 3,
    formal: 3,
    sporty: 3,
    vintage: 3,
    minimalist: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  console.log(`[🧠 DataRouter] Returning default style profile`);
  return defaultProfile;
}

/**
 * Get tribes with fallback
 */
export async function getTribes(query?: {
  featured?: boolean;
  archetype?: string;
  limit?: number;
}): Promise<any[]> {
  console.log('[🔍 DataRouter] getTribes called with query:', query);
  
  // Try Supabase if enabled and healthy
  if (shouldUseSupabase() && isHealthy()) {
    try {
      const result = await supabaseSource.getTribes(query);
      if (result && result.length > 0) {
        console.log(`[🧠 DataRouter] Returning ${result.length} tribes from Supabase`);
        return result;
      }
    } catch (error) {
      console.warn('[DataRouter] Supabase tribes failed, falling back:', error);
    }
  }
  
  // Fallback to local/mock
  const result = await localFallback.getTribes(query);
  console.log(`[🧠 DataRouter] Returning ${result.length} tribes from local fallback`);
  return result;
}

/**
 * Get dashboard stats with fallback
 */
export async function getDashboardStats(userId: string): Promise<any> {
  console.log('[🔍 DataRouter] getDashboardStats called for user:', userId);
  
  // Try Supabase if enabled and healthy
  if (shouldUseSupabase() && isHealthy()) {
    try {
      const result = await supabaseSource.getDashboardStats(userId);
      console.log(`[🧠 DataRouter] Returning dashboard stats from Supabase`);
      return result;
    } catch (error) {
      console.warn('[DataRouter] Supabase dashboard stats failed, falling back:', error);
    }
  }
  
  // Fallback to local/mock
  const result = await localFallback.getDashboardStats(userId);
  console.log(`[🧠 DataRouter] Returning dashboard stats from local fallback`);
  return result;
}

/**
 * Get feed with pagination support
 * @param options - Feed options including offset and limit
 * @returns Array of feed outfits
 */
export async function getFeed(options: { 
  userId?: string; 
  count?: number; 
  archetypes?: string[];
  offset?: number;
}): Promise<any[]> {
  const count = Math.max(12, options?.count ?? 18);
  const offset = options?.offset ?? 0;
  const archetypes = options?.archetypes ?? ['casual_chic','urban','klassiek'];
  
  // Generate more candidates to support pagination
  const totalCandidates = generateMockOutfits(count * 5); // Generate 5x more for pagination
  const ranked = rankOutfits(totalCandidates, { archetypes, season: 'summer' });
  const diversified = ensureDiversity(ranked, 4);
  
  // Apply pagination
  const paginatedResults = diversified
    .slice(offset, offset + count)
    .map(x => x.outfit);
  
  return paginatedResults;
}