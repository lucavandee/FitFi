// src/services/data/localSource.ts
import { DATA_CONFIG } from "@/config/dataConfig";
import type { BoltProduct, Outfit, FitFiUserProfile } from "./types";

/**
 * Simple runtime cache for local JSON files
 * Prevents duplicate fetches within the same session
 */
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Generic JSON fetcher with caching
 * @param path - Path to JSON file
 * @returns Parsed JSON data
 */
async function getJSON<T>(path: string): Promise<T> {
  const cacheKey = path;
  const cached = cache.get(cacheKey);
  
  // Return cached data if still valid
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data as T;
  }
  
  try {
    console.log(`[LocalSource] Fetching: ${path}`);
    const res = await fetch(path, { 
      cache: "no-store",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    if (!res.ok) {
      throw new Error(`Local JSON fetch failed: ${path} (${res.status}: ${res.statusText})`);
    }
    
    const data = await res.json() as T;
    
    // Cache the result
    cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
    
    console.log(`[LocalSource] Cached: ${path} (${Array.isArray(data) ? data.length : 'object'} items)`);
    return data;
  } catch (error) {
    console.error(`[LocalSource] Error fetching ${path}:`, error);
    
    // Remove failed cache entry
    cache.delete(cacheKey);
    throw error;
  }
}

/**
 * Get products from local JSON
 * @returns Array of BoltProducts
 */
export async function getLocalProducts(): Promise<BoltProduct[]> {
  try {
    const products = await getJSON<BoltProduct[]>(DATA_CONFIG.LOCAL_JSON.products);
    
    // Validate array
    if (!Array.isArray(products)) {
      console.warn('[LocalSource] Products data is not an array, returning empty array');
      return [];
    }
    
    // Filter out invalid products
    const validProducts = products.filter(product => 
      product && 
      typeof product === 'object' && 
      product.id && 
      product.title
    );
    
    if (validProducts.length !== products.length) {
      console.warn(`[LocalSource] Filtered out ${products.length - validProducts.length} invalid products`);
    }
    
    return validProducts;
  } catch (error) {
    console.error('[LocalSource] Error loading products:', error);
    return [];
  }
}

/**
 * Get outfits from local JSON
 * @returns Array of Outfits
 */
export async function getLocalOutfits(): Promise<Outfit[]> {
  try {
    const outfits = await getJSON<Outfit[]>(DATA_CONFIG.LOCAL_JSON.outfits);
    
    // Validate array
    if (!Array.isArray(outfits)) {
      console.warn('[LocalSource] Outfits data is not an array, returning empty array');
      return [];
    }
    
    // Filter out invalid outfits
    const validOutfits = outfits.filter(outfit => 
      outfit && 
      typeof outfit === 'object' && 
      outfit.id && 
      outfit.name
    );
    
    if (validOutfits.length !== outfits.length) {
      console.warn(`[LocalSource] Filtered out ${outfits.length - validOutfits.length} invalid outfits`);
    }
    
    return validOutfits;
  } catch (error) {
    console.error('[LocalSource] Error loading outfits:', error);
    return [];
  }
}

/**
 * Get user profile from local JSON
 * @returns User profile
 */
export async function getLocalUser(): Promise<FitFiUserProfile> {
  try {
    const user = await getJSON<FitFiUserProfile>(DATA_CONFIG.LOCAL_JSON.user);
    
    // Validate user object
    if (!user || typeof user !== 'object' || !user.id) {
      console.warn('[LocalSource] Invalid user data, returning default user');
      return getDefaultUser();
    }
    
    return user;
  } catch (error) {
    console.error('[LocalSource] Error loading user:', error);
    return getDefaultUser();
  }
}

/**
 * Get tribes from local JSON
 * @returns Array of Tribes
 */
export async function getLocalTribes(): Promise<Tribe[]> {
  try {
    const tribes = await getJSON<Tribe[]>(DATA_CONFIG.LOCAL_JSON.tribes);
    
    // Validate array
    if (!Array.isArray(tribes)) {
      console.warn('[LocalSource] Tribes data is not an array, returning empty array');
      return [];
    }
    
    // Filter out invalid tribes
    const validTribes = tribes.filter(tribe => 
      tribe && 
      typeof tribe === 'object' && 
      tribe.id && 
      tribe.name &&
      tribe.slug
    );
    
    if (validTribes.length !== tribes.length) {
      console.warn(`[LocalSource] Filtered out ${tribes.length - validTribes.length} invalid tribes`);
    }
    
    return validTribes;
  } catch (error) {
    console.error('[LocalSource] Error loading tribes:', error);
    return [];
  }
}

/**
 * Get tribes from local JSON
 * @returns Array of Tribes
 */
export async function getLocalTribes(): Promise<Tribe[]> {
  try {
    const tribes = await getJSON<Tribe[]>(DATA_CONFIG.LOCAL_JSON.tribes);
    
    // Validate array
    if (!Array.isArray(tribes)) {
      console.warn('[LocalSource] Tribes data is not an array, returning empty array');
      return [];
    }
    
    // Filter out invalid tribes
    const validTribes = tribes.filter(tribe => 
      tribe && 
      typeof tribe === 'object' && 
      tribe.id && 
      tribe.name &&
      tribe.slug
    );
    
    if (validTribes.length !== tribes.length) {
      console.warn(`[LocalSource] Filtered out ${tribes.length - validTribes.length} invalid tribes`);
    }
    
    return validTribes;
  } catch (error) {
    console.error('[LocalSource] Error loading tribes:', error);
    return [];
  }
}

/**
 * Get default user profile as fallback
 * @returns Default user profile
 */
function getDefaultUser(): FitFiUserProfile {
  return {
    id: 'local-user',
    name: 'Local User',
    email: 'user@fitfi.app',
    gender: 'female',
    archetypes: ['casual_chic'],
    preferences: {
      casual: 3,
      formal: 3,
      sporty: 3,
      vintage: 3,
      minimalist: 3
    }
  };
}

/**
 * Clear local cache
 * Useful for development and testing
 */
export function clearLocalCache(): void {
  cache.clear();
  console.log('[LocalSource] Cache cleared');
}

/**
 * Get cache statistics
 * @returns Cache stats for debugging
 */
export function getCacheStats(): {
  size: number;
  entries: Array<{ path: string; age: number; size: string }>;
} {
  const entries = Array.from(cache.entries()).map(([path, entry]) => ({
    path,
    age: Date.now() - entry.timestamp,
    size: JSON.stringify(entry.data).length > 1000 ? 'large' : 'small'
  }));

  return {
    size: cache.size,
    entries
  };
}

/**
 * Preload all local data sources
 * Useful for performance optimization
 */
export async function preloadLocalData(): Promise<{
  products: BoltProduct[];
  outfits: Outfit[];
  user: FitFiUserProfile;
}> {
  try {
    console.log('[LocalSource] Preloading all local data...');
    
    const [products, outfits, user] = await Promise.all([
      getLocalProducts(),
      getLocalOutfits(),
      getLocalUser()
    ]);
    
    console.log('[LocalSource] Preload complete:', {
      products: products.length,
      outfits: outfits.length,
      user: user.id
    });
    
    return { products, outfits, user };
  } catch (error) {
    console.error('[LocalSource] Preload failed:', error);
    throw error;
  }
}

/**
 * Validate local data integrity
 * @returns Validation results
 */
export async function validateLocalData(): Promise<{
  isValid: boolean;
  errors: string[];
  warnings: string[];
}> {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  try {
    // Validate products
    const products = await getLocalProducts();
    if (products.length === 0) {
      warnings.push('No products found in local data');
    }
    
    // Check for required product fields
    products.forEach((product, index) => {
      if (!product.id) errors.push(`Product ${index}: missing id`);
      if (!product.title) errors.push(`Product ${index}: missing title`);
      if (!product.category) warnings.push(`Product ${index}: missing category`);
    });
    
    // Validate outfits
    const outfits = await getLocalOutfits();
    if (outfits.length === 0) {
      warnings.push('No outfits found in local data');
    }
    
    // Check for required outfit fields
    outfits.forEach((outfit, index) => {
      if (!outfit.id) errors.push(`Outfit ${index}: missing id`);
      if (!outfit.name) errors.push(`Outfit ${index}: missing name`);
      if (!outfit.items || outfit.items.length === 0) {
        warnings.push(`Outfit ${index}: no items`);
      }
    });
    
    // Validate user
    const user = await getLocalUser();
    if (!user.id) errors.push('User: missing id');
    if (!user.name) warnings.push('User: missing name');
    
  } catch (error) {
    errors.push(`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}