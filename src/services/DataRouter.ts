import { USE_SUPABASE, USE_BOLT, USE_ZALANDO, API_CONFIG, DEBUG_MODE } from '../config/app-config';
import { UserProfile } from '../context/UserContext';
import { Outfit, Product, Season } from '../engine';
import { generateRecommendations, getRecommendedProducts } from '../engine/recommendationEngine';
import { generateMockUser, generateMockGamification, generateMockOutfits, generateMockProducts } from '../utils/mockDataUtils';
import { getZalandoProducts } from '../data/zalandoProductsAdapter';
import { fetchProductsFromSupabase, getUserById, getUserGamification, updateUserGamification, completeChallenge, getDailyChallenges } from '../services/supabaseService';
import boltService from './boltService';
import { TEST_USER_ID } from '../lib/supabase';
import { enrichZalandoProducts } from './productEnricher';
import { BoltProduct } from '../types/BoltProduct';
import outfitGenerator from './outfitGenerator';
import outfitEnricher from './outfitEnricher';
import { getBoltProductsFromJSON } from '../utils/boltProductsUtils';
import { safeFetch, fetchWithRetry } from '../utils/fetchUtils';

// Data source type
export type DataSource = 'supabase' | 'bolt' | 'zalando' | 'local';

// Cache interface
interface CacheItem<T> {
  data: T;
  timestamp: number;
  source: DataSource;
}

// Fetch attempt interface
interface FetchAttempt {
  source: DataSource;
  success: boolean;
  error?: string;
  timestamp: string;
  duration?: number;
}

// Fetch diagnostics interface
interface FetchDiagnostics {
  operation: string;
  timestamp: string;
  attempts: FetchAttempt[];
  finalSource: DataSource;
  cacheUsed: boolean;
  cacheAge?: number;
}

// In-memory cache
const cache = new Map<string, CacheItem<any>>();

// Current data source
let currentDataSource: DataSource = 'local';

// Fetch diagnostics
let fetchDiagnostics: FetchDiagnostics = {
  operation: 'none',
  timestamp: new Date().toISOString(),
  attempts: [],
  finalSource: 'local',
  cacheUsed: false
};

// In-memory storage for BoltProducts
let boltProductsCache: BoltProduct[] = [];

/**
 * Clear the cache
 */
export function clearCache(): void {
  cache.clear();
  if (DEBUG_MODE) {
    console.log('[🧠 DataRouter] Cache cleared');
  }
}

/**
 * Get the current data source
 * @returns Current data source
 */
export function getDataSource(): DataSource {
  return currentDataSource;
}

/**
 * Get fetch diagnostics
 * @returns Fetch diagnostics
 */
export function getFetchDiagnostics(): FetchDiagnostics {
  return fetchDiagnostics;
}

/**
 * Get fetch diagnostics summary as a string
 * @returns Fetch diagnostics summary
 */
export function getFetchDiagnosticsSummary(): string {
  const { operation, timestamp, attempts, finalSource, cacheUsed, cacheAge } = fetchDiagnostics;
  
  let summary = `[🧠 DataRouter] ${operation} at ${new Date(timestamp).toLocaleTimeString()}\n`;
  
  if (cacheUsed) {
    summary += `→ Using cached data (${Math.round((cacheAge || 0) / 1000)}s old)\n`;
  } else {
    attempts.forEach(attempt => {
      summary += `→ Tried ${attempt.source}: ${attempt.success ? '✅' : '❌'}`;
      if (attempt.error) {
        summary += ` (${attempt.error})`;
      }
      if (attempt.duration !== undefined) {
        summary += ` [${attempt.duration}ms]`;
      }
      summary += '\n';
    });
    
    summary += `→ Using source: ${finalSource}\n`;
  }
  
  return summary;
}

/**
 * Reset fetch diagnostics
 * @param operation - Operation name
 */
function resetDiagnostics(operation: string): void {
  fetchDiagnostics = {
    operation,
    timestamp: new Date().toISOString(),
    attempts: [],
    finalSource: 'local',
    cacheUsed: false
  };
}

/**
 * Add a fetch attempt to diagnostics
 * @param source - Data source
 * @param success - Whether the attempt was successful
 * @param error - Optional error message
 * @param duration - Optional duration in milliseconds
 */
function addAttempt(source: DataSource, success: boolean, error?: string, duration?: number): void {
  fetchDiagnostics.attempts.push({
    source,
    success,
    error,
    timestamp: new Date().toISOString(),
    duration
  });
}

/**
 * Set the final data source in diagnostics
 * @param source - Final data source
 */
function setFinalSource(source: DataSource): void {
  fetchDiagnostics.finalSource = source;
  currentDataSource = source;
}

/**
 * Get data from cache if available and not expired
 * @param key - Cache key
 * @returns Cached data or null if not found or expired
 */
function getFromCache<T>(key: string): { data: T; source: DataSource; age: number } | null {
  const cached = cache.get(key);
  
  if (cached) {
    const now = Date.now();
    const age = now - cached.timestamp;
    
    // Check if cache is still valid
    if (age < API_CONFIG.cacheTTL) {
      if (DEBUG_MODE) {
        console.log(`[🧠 DataRouter] Cache hit for ${key} (${Math.round(age / 1000)}s old)`);
      }
      
      // Update diagnostics
      fetchDiagnostics.cacheUsed = true;
      fetchDiagnostics.cacheAge = age;
      setFinalSource(cached.source);
      
      return { 
        data: cached.data,
        source: cached.source,
        age
      };
    } else {
      if (DEBUG_MODE) {
        console.log(`[🧠 DataRouter] Cache expired for ${key} (${Math.round(age / 1000)}s old)`);
      }
      
      // Remove expired cache
      cache.delete(key);
    }
  }
  
  return null;
}

/**
 * Save data to cache
 * @param key - Cache key
 * @param data - Data to cache
 * @param source - Data source
 */
function saveToCache<T>(key: string, data: T, source: DataSource): void {
  if (!API_CONFIG.cacheTTL || !FEATURES.caching) return;
  
  cache.set(key, {
    data,
    timestamp: Date.now(),
    source
  });
  
  if (DEBUG_MODE) {
    console.log(`[🧠 DataRouter] Cached data for ${key} from ${source}`);
  }
}

/**
 * Load BoltProducts from JSON file
 * @returns Promise that resolves to an array of BoltProducts
 */
async function loadBoltProducts(): Promise<BoltProduct[]> {
  // If we already have BoltProducts in memory, return them
  if (boltProductsCache.length > 0) {
    return boltProductsCache;
  }
  
  try {
    // Try to load BoltProducts from API
    if (USE_BOLT) {
      try {
        const response = await boltService.fetchFromBolt<{ products: BoltProduct[] }>('/products');
        
        if (response && response.products && response.products.length > 0) {
          console.log(`[🧠 DataRouter] Loaded ${response.products.length} BoltProducts from API`);
          
          // Store in memory cache
          boltProductsCache = response.products;
          
          return response.products;
        }
      } catch (apiError) {
        console.error('[🧠 DataRouter] Error loading BoltProducts from API:', apiError);
      }
    }
    
    // If API failed or is disabled, try to load from JSON file
    const products = await getBoltProductsFromJSON();
    
    if (products && products.length > 0) {
      // Store in memory cache
      boltProductsCache = products;
      
      console.log(`[🧠 DataRouter] Loaded ${products.length} BoltProducts from JSON file`);
      
      return products;
    }
    
    console.warn('[🧠 DataRouter] No BoltProducts found, returning empty array');
    return [];
  } catch (error) {
    console.error('[🧠 DataRouter] Error loading BoltProducts:', error);
    return [];
  }
}

/**
 * Get outfits for a user
 * @param user - User profile
 * @param options - Optional generation options
 * @returns Array of outfits
 */
export async function getOutfits(
  user: UserProfile,
  options?: any
): Promise<Outfit[]> {
  // Reset diagnostics
  resetDiagnostics('getOutfits');
  
  // Generate cache key
  const cacheKey = `outfits-${user.id}-${JSON.stringify(options || {})}`;
  
  // Check cache first if caching is enabled
  if (FEATURES.caching) {
    const cached = getFromCache<Outfit[]>(cacheKey);
    if (cached) {
      return cached.data;
    }
  }
  
  // Start timing
  const startTime = Date.now();
  
  // Try Supabase first if enabled
  if (USE_SUPABASE) {
    try {
      // Fetch products from Supabase
      const supabaseProducts = await fetchProductsFromSupabase();
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      if (supabaseProducts && supabaseProducts.length > 0) {
        // Convert to Product format
        const products = supabaseProducts.map(p => ({
          id: p.id,
          name: p.name,
          imageUrl: p.image_url || p.imageUrl,
          type: p.type || p.category,
          category: p.category,
          styleTags: p.tags || ['casual'],
          description: p.description || `${p.name} van ${p.brand || 'onbekend merk'}`,
          price: typeof p.price === 'number' ? p.price : parseFloat(p.price || '0'),
          brand: p.brand,
          affiliateUrl: p.url || p.affiliate_url,
          season: ['spring', 'summer', 'autumn', 'winter'] // Default all seasons
        }));
        
        // Generate outfits
        const outfits = await generateRecommendations(user, {
          ...options,
          useZalandoProducts: false
        });
        
        // Add attempt to diagnostics
        addAttempt('supabase', true, undefined, duration);
        setFinalSource('supabase');
        
        // Cache the result
        saveToCache(cacheKey, outfits, 'supabase');
        
        return outfits;
      }
      
      // Add failed attempt to diagnostics
      addAttempt('supabase', false, 'No products found', duration);
    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Add failed attempt to diagnostics
      addAttempt('supabase', false, error instanceof Error ? error.message : 'Unknown error', duration);
      
      if (DEBUG_MODE) {
        console.error('[🧠 DataRouter] Supabase error:', error);
      }
    }
  }
  
  // Try Bolt API if enabled
  if (USE_BOLT) {
    const boltStartTime = Date.now();
    
    try {
      // Fetch outfits from local JSON
      const response = await boltService.fetchOutfits();
      
      const boltEndTime = Date.now();
      const boltDuration = boltEndTime - boltStartTime;
      
      if (response && response.length > 0) {
        // Add attempt to diagnostics
        addAttempt('bolt', true, undefined, boltDuration);
        setFinalSource('bolt');
        
        // Cache the result
        saveToCache(cacheKey, response, 'bolt');
        
        return response;
      }
      
      // Add failed attempt to diagnostics
      addAttempt('bolt', false, 'No outfits found', boltDuration);
    } catch (error) {
      const boltEndTime = Date.now();
      const boltDuration = boltEndTime - boltStartTime;
      
      // Add failed attempt to diagnostics
      addAttempt('bolt', false, error instanceof Error ? error.message : 'Unknown error', boltDuration);
      
      if (DEBUG_MODE) {
        console.error('[🧠 DataRouter] Bolt API error:', error);
      }
    }
  }
  
  // Try Zalando if Supabase and Bolt failed
  if (USE_ZALANDO) {
    const zalandoStartTime = Date.now();
    
    try {
      // Try to load BoltProducts from JSON file
      const boltProducts = await loadBoltProducts();
      
      if (boltProducts && boltProducts.length > 0) {
        console.log(`[🧠 DataRouter] Using ${boltProducts.length} BoltProducts to generate outfits`);
        
        // Generate outfits from BoltProducts
        const outfits = outfitGenerator.generateOutfitsFromBoltProducts(
          boltProducts,
          user.stylePreferences.casual > user.stylePreferences.formal ? 'casual_chic' : 'klassiek',
          user.gender === 'male' ? 'male' : 'female',
        )
      }
      // Try to load BoltProducts from local JSON
      const response = await boltService.fetchProducts();
      
      if (response && response.length > 0) {
        console.log(`[🧠 DataRouter] Loaded ${response.length} BoltProducts from local JSON`);
        
        // Store in memory cache
        boltProductsCache = response;
        
        return response;
      }
      
      // If BoltProducts failed, try using Zalando products directly
      const zalandoProducts = await getZalandoProducts();
      
      if (zalandoProducts && zalandoProducts.length > 0) {
        // Generate outfits
        const outfits = await generateRecommendations(user, {
          ...options,
          useZalandoProducts: true
        });
        
        // Try to enrich outfits with BoltProducts
        const enrichedOutfits = outfits.map(outfit => {
          try {
            return outfitEnricher.enrichOutfitWithBoltProducts(outfit, boltProducts);
          } catch (error) {
            console.error('[🧠 DataRouter] Error enriching outfit:', error);
            return outfit;
          }
        });
        
        const zalandoEndTime = Date.now();
        const zalandoDuration = zalandoEndTime - zalandoStartTime;
        
        // Add attempt to diagnostics
        addAttempt('zalando', true, undefined, zalandoDuration);
        setFinalSource('zalando');
        
        // Cache the result
        saveToCache(cacheKey, enrichedOutfits, 'zalando');
        
        return enrichedOutfits;
      }
      
      // Add failed attempt to diagnostics
      const zalandoEndTime = Date.now();
      const zalandoDuration = zalandoEndTime - zalandoStartTime;
      addAttempt('zalando', false, 'No products found', zalandoDuration);
    } catch (error) {
      const zalandoEndTime = Date.now();
      const zalandoDuration = zalandoEndTime - zalandoStartTime;
      
      // Add failed attempt to diagnostics
      addAttempt('zalando', false, error instanceof Error ? error.message : 'Unknown error', zalandoDuration);
      
      if (DEBUG_MODE) {
        console.error('[🧠 DataRouter] Zalando error:', error);
      }
    }
  }
  
  // Fallback to local data
  const localStartTime = Date.now();
  
  try {
    // Generate outfits from local data
    const outfits = await generateRecommendations(user, {
      ...options,
      useZalandoProducts: false
    });
    
    const localEndTime = Date.now();
    const localDuration = localEndTime - localStartTime;
    
    // Add attempt to diagnostics
    addAttempt('local', true, undefined, localDuration);
    setFinalSource('local');
    
    // Cache the result
    saveToCache(cacheKey, outfits, 'local');
    
    return outfits;
  } catch (error) {
    const localEndTime = Date.now();
    const localDuration = localEndTime - localStartTime;
    
    // Add failed attempt to diagnostics
    addAttempt('local', false, error instanceof Error ? error.message : 'Unknown error', localDuration);
    
    if (DEBUG_MODE) {
      console.error('[🧠 DataRouter] Local data error:', error);
    }
    
    // Return empty array as last resort
    return [];
  }
}

/**
 * Get recommended products for a user
 * @param user - User profile
 * @param count - Number of products to recommend
 * @param season - Optional season to filter by
 * @returns Array of recommended products
 */
export async function getRecommendedProducts(
  user: UserProfile,
  count: number = 9,
  season?: Season
): Promise<Product[]> {
  // Reset diagnostics
  resetDiagnostics('getRecommendedProducts');
  
  // Generate cache key
  const cacheKey = `products-${user.id}-${count}-${season || 'all'}`;
  
  // Check cache first if caching is enabled
  if (FEATURES.caching) {
    const cached = getFromCache<Product[]>(cacheKey);
    if (cached) {
      return cached.data;
    }
  }
  
  // Start timing
  const startTime = Date.now();
  
  // Try Supabase first if enabled
  if (USE_SUPABASE) {
    try {
      // Fetch products from Supabase
      const supabaseProducts = await fetchProductsFromSupabase();
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      if (supabaseProducts && supabaseProducts.length > 0) {
        // Convert to Product format
        const products = supabaseProducts.map(p => ({
          id: p.id,
          name: p.name,
          imageUrl: p.image_url || p.imageUrl,
          type: p.type || p.category,
          category: p.category,
          styleTags: p.tags || ['casual'],
          description: p.description || `${p.name} van ${p.brand || 'onbekend merk'}`,
          price: typeof p.price === 'number' ? p.price : parseFloat(p.price || '0'),
          brand: p.brand,
          affiliateUrl: p.url || p.affiliate_url,
          season: ['spring', 'summer', 'autumn', 'winter'] // Default all seasons
        }));
        
        // Get recommended products
        const recommendedProducts = await getRecommendedProducts(user, count, season);
        
        // Add attempt to diagnostics
        addAttempt('supabase', true, undefined, duration);
        setFinalSource('supabase');
        
        // Cache the result
        saveToCache(cacheKey, recommendedProducts, 'supabase');
        
        return recommendedProducts;
      }
      
      // Add failed attempt to diagnostics
      addAttempt('supabase', false, 'No products found', duration);
    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Add failed attempt to diagnostics
      addAttempt('supabase', false, error instanceof Error ? error.message : 'Unknown error', duration);
      
      if (DEBUG_MODE) {
        console.error('[🧠 DataRouter] Supabase error:', error);
      }
    }
  }
  
  // Try Bolt API if enabled
  if (USE_BOLT) {
    const boltStartTime = Date.now();
    
    try {
      // Fetch products from local JSON
      const response = await boltService.fetchProducts();
      
      const boltEndTime = Date.now();
      const boltDuration = boltEndTime - boltStartTime;
      
      if (response && response.length > 0) {
        // Add attempt to diagnostics
        addAttempt('bolt', true, undefined, boltDuration);
        setFinalSource('bolt');
        
        // Cache the result
        saveToCache(cacheKey, response, 'bolt');
        
        return response;
      }
      
      // Add failed attempt to diagnostics
      addAttempt('bolt', false, 'No products found', boltDuration);
    } catch (error) {
      const boltEndTime = Date.now();
      const boltDuration = boltEndTime - boltStartTime;
      
      // Add failed attempt to diagnostics
      addAttempt('bolt', false, error instanceof Error ? error.message : 'Unknown error', boltDuration);
      
      if (DEBUG_MODE) {
        console.error('[🧠 DataRouter] Bolt API error:', error);
      }
    }
  }
  
  // Try Zalando if Supabase and Bolt failed
  if (USE_ZALANDO) {
    const zalandoStartTime = Date.now();
    
    try {
      // Try to load BoltProducts from JSON file
      const boltProducts = await loadBoltProducts();
      
      if (boltProducts && boltProducts.length > 0) {
        console.log(`[🧠 DataRouter] Using ${boltProducts.length} BoltProducts as recommended products`);
        
        // Filter BoltProducts by archetype match
        const archetypeProducts = boltProducts.filter(product => {
          // Determine primary archetype based on user preferences
          let primaryArchetype = 'casual_chic';
          if (user.stylePreferences.formal > user.stylePreferences.casual) {
            primaryArchetype = 'klassiek';
          } else if (user.stylePreferences.sporty > user.stylePreferences.casual) {
            primaryArchetype = 'streetstyle';
          } else if (user.stylePreferences.vintage > user.stylePreferences.casual) {
            primaryArchetype = 'retro';
          } else if (user.stylePreferences.minimalist > user.stylePreferences.casual) {
            primaryArchetype = 'urban';
          }
          
          // Check if product matches archetype
          const score = product.archetypeMatch[primaryArchetype] || 0;
          return score >= 0.5;
        });
        
        // Filter by gender
        const genderProducts = archetypeProducts.filter(product => 
          product.gender === (user.gender === 'male' ? 'male' : 'female')
        );
        
        // Convert to Product format
        const products = genderProducts.map(p => ({
          id: p.id,
          name: p.title,
          imageUrl: p.imageUrl,
          type: p.type,
          category: p.type,
          styleTags: p.styleTags,
          description: `${p.title} van ${p.brand}`,
          price: p.price,
          brand: p.brand,
          affiliateUrl: p.affiliateUrl,
          season: [p.season === 'all_season' ? 'autumn' : p.season] // Convert to array
        }));
        
        // Limit to requested count
        const limitedProducts = products.slice(0, count);
        
        const zalandoEndTime = Date.now();
        const zalandoDuration = zalandoEndTime - zalandoStartTime;
        
        // Add attempt to diagnostics
        addAttempt('zalando', true, undefined, zalandoDuration);
        setFinalSource('zalando');
        
        // Cache the result
        saveToCache(cacheKey, limitedProducts, 'zalando');
        
        return limitedProducts;
      }
      
      // If BoltProducts failed, try using Zalando products directly
      const zalandoProducts = await getZalandoProducts();
      
      if (zalandoProducts && zalandoProducts.length > 0) {
        // Get recommended products
        const recommendedProducts = await getRecommendedProducts(user, count, season);
        
        const zalandoEndTime = Date.now();
        const zalandoDuration = zalandoEndTime - zalandoStartTime;
        
        // Add attempt to diagnostics
        addAttempt('zalando', true, undefined, zalandoDuration);
        setFinalSource('zalando');
        
        // Cache the result
        saveToCache(cacheKey, recommendedProducts, 'zalando');
        
        return recommendedProducts;
      }
      
      // Add failed attempt to diagnostics
      const zalandoEndTime = Date.now();
      const zalandoDuration = zalandoEndTime - zalandoStartTime;
      addAttempt('zalando', false, 'No products found', zalandoDuration);
    } catch (error) {
      const zalandoEndTime = Date.now();
      const zalandoDuration = zalandoEndTime - zalandoStartTime;
      
      // Add failed attempt to diagnostics
      addAttempt('zalando', false, error instanceof Error ? error.message : 'Unknown error', zalandoDuration);
      
      if (DEBUG_MODE) {
        console.error('[🧠 DataRouter] Zalando error:', error);
      }
    }
  }
  
  // Fallback to local data
  const localStartTime = Date.now();
  
  try {
    // Generate mock products
    const mockProducts = generateMockProducts(undefined, count);
    
    const localEndTime = Date.now();
    const localDuration = localEndTime - localStartTime;
    
    // Add attempt to diagnostics
    addAttempt('local', true, undefined, localDuration);
    setFinalSource('local');
    
    // Cache the result
    saveToCache(cacheKey, mockProducts, 'local');
    
    return mockProducts;
  } catch (error) {
    const localEndTime = Date.now();
    const localDuration = localEndTime - localStartTime;
    
    // Add failed attempt to diagnostics
    addAttempt('local', false, error instanceof Error ? error.message : 'Unknown error', localDuration);
    
    if (DEBUG_MODE) {
      console.error('[🧠 DataRouter] Local data error:', error);
    }
    
    // Return empty array as last resort
    return [];
  }
}

/**
 * Get user data
 * @param userId - User ID
 * @returns User profile or null if not found
 */
export async function getUserData(userId: string): Promise<UserProfile | null> {
  // Reset diagnostics
  resetDiagnostics('getUserData');
  
  // Generate cache key
  const cacheKey = `user-${userId}`;
  
  // Check cache first if caching is enabled
  if (FEATURES.caching) {
    const cached = getFromCache<UserProfile>(cacheKey);
    if (cached) {
      return cached.data;
    }
  }
  
  // Start timing
  const startTime = Date.now();
  
  // Try Supabase first if enabled
  if (USE_SUPABASE) {
    try {
      // Fetch user from Supabase
      const user = await getUserById(userId);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      if (user) {
        // Add attempt to diagnostics
        addAttempt('supabase', true, undefined, duration);
        setFinalSource('supabase');
        
        // Cache the result
        saveToCache(cacheKey, user, 'supabase');
        
        return user;
      }
      
      // Add failed attempt to diagnostics
      addAttempt('supabase', false, 'User not found', duration);
    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Add failed attempt to diagnostics
      addAttempt('supabase', false, error instanceof Error ? error.message : 'Unknown error', duration);
      
      if (DEBUG_MODE) {
        console.error('[🧠 DataRouter] Supabase error:', error);
      }
    }
  }
  
  // Try Bolt API if enabled
  if (USE_BOLT) {
    const boltStartTime = Date.now();
    
    try {
      // Fetch user from local JSON
      const user = await boltService.fetchUser();
      
      const boltEndTime = Date.now();
      const boltDuration = boltEndTime - boltStartTime;
      
      if (user) {
        // Add attempt to diagnostics
        addAttempt('bolt', true, undefined, boltDuration);
        setFinalSource('bolt');
        
        // Cache the result
        saveToCache(cacheKey, user, 'bolt');
        
        return user;
      }
      
      // Add failed attempt to diagnostics
      addAttempt('bolt', false, 'User not found', boltDuration);
    } catch (error) {
      const boltEndTime = Date.now();
      const boltDuration = boltEndTime - boltStartTime;
      
      // Add failed attempt to diagnostics
      addAttempt('bolt', false, error instanceof Error ? error.message : 'Unknown error', boltDuration);
      
      if (DEBUG_MODE) {
        console.error('[🧠 DataRouter] Bolt API error:', error);
      }
    }
  }
  
  // Fallback to local data
  const localStartTime = Date.now();
  
  try {
    // Generate mock user
    const mockUser = generateMockUser(userId);
    
    const localEndTime = Date.now();
    const localDuration = localEndTime - localStartTime;
    
    // Add attempt to diagnostics
    addAttempt('local', true, undefined, localDuration);
    setFinalSource('local');
    
    // Cache the result
    saveToCache(cacheKey, mockUser, 'local');
    
    return mockUser;
  } catch (error) {
    const localEndTime = Date.now();
    const localDuration = localEndTime - localStartTime;
    
    // Add failed attempt to diagnostics
    addAttempt('local', false, error instanceof Error ? error.message : 'Unknown error', localDuration);
    
    if (DEBUG_MODE) {
      console.error('[🧠 DataRouter] Local data error:', error);
    }
    
    // Return null as last resort
    return null;
  }
}

/**
 * Get gamification data for a user
 * @param userId - User ID
 * @returns Gamification data or null if not found
 */
export async function getGamificationData(userId: string): Promise<any | null> {
  // Reset diagnostics
  resetDiagnostics('getGamificationData');
  
  // Generate cache key
  const cacheKey = `gamification-${userId}`;
  
  // Check cache first if caching is enabled
  if (FEATURES.caching) {
    const cached = getFromCache<any>(cacheKey);
    if (cached) {
      return cached.data;
    }
  }
  
  // Start timing
  const startTime = Date.now();
  
  // Try Supabase first if enabled
  if (USE_SUPABASE) {
    try {
      // Fetch gamification data from Supabase
      const gamificationData = await getUserGamification(userId);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      if (gamificationData) {
        // Add attempt to diagnostics
        addAttempt('supabase', true, undefined, duration);
        setFinalSource('supabase');
        
        // Cache the result
        saveToCache(cacheKey, gamificationData, 'supabase');
        
        return gamificationData;
      }
      
      // Add failed attempt to diagnostics
      addAttempt('supabase', false, 'Gamification data not found', duration);
    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Add failed attempt to diagnostics
      addAttempt('supabase', false, error instanceof Error ? error.message : 'Unknown error', duration);
      
      if (DEBUG_MODE) {
        console.error('[🧠 DataRouter] Supabase error:', error);
      }
    }
  }
  
  // Try Bolt API if enabled
  if (USE_BOLT) {
    const boltStartTime = Date.now();
    
    try {
      // Fetch gamification data from local JSON
      const gamificationData = await boltService.fetchGamification();
      
      const boltEndTime = Date.now();
      const boltDuration = boltEndTime - boltStartTime;
      
      if (gamificationData) {
        // Add attempt to diagnostics
        addAttempt('bolt', true, undefined, boltDuration);
        setFinalSource('bolt');
        
        // Cache the result
        saveToCache(cacheKey, gamificationData, 'bolt');
        
        return gamificationData;
      }
      
      // Add failed attempt to diagnostics
      addAttempt('bolt', false, 'Gamification data not found', boltDuration);
    } catch (error) {
      const boltEndTime = Date.now();
      const boltDuration = boltEndTime - boltStartTime;
      
      // Add failed attempt to diagnostics
      addAttempt('bolt', false, error instanceof Error ? error.message : 'Unknown error', boltDuration);
      
      if (DEBUG_MODE) {
        console.error('[🧠 DataRouter] Bolt API error:', error);
      }
    }
  }
  
  // Fallback to local data
  const localStartTime = Date.now();
  
  try {
    // Generate mock gamification data
    const mockGamificationData = generateMockGamification(userId);
    
    const localEndTime = Date.now();
    const localDuration = localEndTime - localStartTime;
    
    // Add attempt to diagnostics
    addAttempt('local', true, undefined, localDuration);
    setFinalSource('local');
    
    // Cache the result
    saveToCache(cacheKey, mockGamificationData, 'local');
    
    return mockGamificationData;
  } catch (error) {
    const localEndTime = Date.now();
    const localDuration = localEndTime - localStartTime;
    
    // Add failed attempt to diagnostics
    addAttempt('local', false, error instanceof Error ? error.message : 'Unknown error', localDuration);
    
    if (DEBUG_MODE) {
      console.error('[🧠 DataRouter] Local data error:', error);
    }
    
    // Return null as last resort
    return null;
  }
}

/**
 * Update gamification data for a user
 * @param userId - User ID
 * @param updates - Gamification data updates
 * @returns Updated gamification data or null if update failed
 */
export async function updateGamificationData(userId: string, updates: any): Promise<any | null> {
  // Reset diagnostics
  resetDiagnostics('updateGamificationData');
  
  // Start timing
  const startTime = Date.now();
  
  // Try Supabase first if enabled
  if (USE_SUPABASE) {
    try {
      // Update gamification data in Supabase
      const updatedData = await updateUserGamification(userId, updates);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      if (updatedData) {
        // Add attempt to diagnostics
        addAttempt('supabase', true, undefined, duration);
        setFinalSource('supabase');
        
        // Update cache
        const cacheKey = `gamification-${userId}`;
        saveToCache(cacheKey, updatedData, 'supabase');
        
        return updatedData;
      }
      
      // Add failed attempt to diagnostics
      addAttempt('supabase', false, 'Update failed', duration);
    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Add failed attempt to diagnostics
      addAttempt('supabase', false, error instanceof Error ? error.message : 'Unknown error', duration);
      
      if (DEBUG_MODE) {
        console.error('[🧠 DataRouter] Supabase error:', error);
      }
    }
  }
  
  // Try Bolt API if enabled
  if (USE_BOLT) {
    const boltStartTime = Date.now();
    
    try {
      // Update gamification data (mock)
      const updatedData = await boltService.updateGamification(userId, updates);
      
      const boltEndTime = Date.now();
      const boltDuration = boltEndTime - boltStartTime;
      
      if (updatedData && updatedData.success) {
        // Add attempt to diagnostics
        addAttempt('bolt', true, undefined, boltDuration);
        setFinalSource('bolt');
        
        // Update cache
        const cacheKey = `gamification-${userId}`;
        saveToCache(cacheKey, updatedData.data || updatedData, 'bolt');
        
        return updatedData.data || updatedData;
      }
      
      // Add failed attempt to diagnostics
      addAttempt('bolt', false, 'Update failed', boltDuration);
    } catch (error) {
      const boltEndTime = Date.now();
      const boltDuration = boltEndTime - boltStartTime;
      
      // Add failed attempt to diagnostics
      addAttempt('bolt', false, error instanceof Error ? error.message : 'Unknown error', boltDuration);
      
      if (DEBUG_MODE) {
        console.error('[🧠 DataRouter] Bolt API error:', error);
      }
    }
  }
  
  // Fallback to local data
  const localStartTime = Date.now();
  
  try {
    // Get current gamification data
    const currentData = await getGamificationData(userId);
    
    // Apply updates
    const updatedData = {
      ...currentData,
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    const localEndTime = Date.now();
    const localDuration = localEndTime - localStartTime;
    
    // Add attempt to diagnostics
    addAttempt('local', true, undefined, localDuration);
    setFinalSource('local');
    
    // Update cache
    const cacheKey = `gamification-${userId}`;
    saveToCache(cacheKey, updatedData, 'local');
    
    return updatedData;
  } catch (error) {
    const localEndTime = Date.now();
    const localDuration = localEndTime - localStartTime;
    
    // Add failed attempt to diagnostics
    addAttempt('local', false, error instanceof Error ? error.message : 'Unknown error', localDuration);
    
    if (DEBUG_MODE) {
      console.error('[🧠 DataRouter] Local data error:', error);
    }
    
    // Return null as last resort
    return null;
  }
}

/**
 * Complete a challenge for a user
 * @param userId - User ID
 * @param challengeId - Challenge ID
 * @returns Whether the challenge was completed successfully
 */
export async function completeChallenge(userId: string, challengeId: string): Promise<boolean> {
  // Reset diagnostics
  resetDiagnostics('completeChallenge');
  
  // Start timing
  const startTime = Date.now();
  
  // Try Supabase first if enabled
  if (USE_SUPABASE) {
    try {
      // Complete challenge in Supabase
      const success = await completeChallenge(userId, challengeId);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      if (success) {
        // Add attempt to diagnostics
        addAttempt('supabase', true, undefined, duration);
        setFinalSource('supabase');
        
        // Invalidate cache
        const cacheKey = `challenges-${userId}`;
        cache.delete(cacheKey);
        
        return true;
      }
      
      // Add failed attempt to diagnostics
      addAttempt('supabase', false, 'Challenge completion failed', duration);
    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Add failed attempt to diagnostics
      addAttempt('supabase', false, error instanceof Error ? error.message : 'Unknown error', duration);
      
      if (DEBUG_MODE) {
        console.error('[🧠 DataRouter] Supabase error:', error);
      }
    }
  }
  
  // Try Bolt API if enabled
  if (USE_BOLT) {
    const boltStartTime = Date.now();
    
    try {
      // Complete challenge (mock)
      const response = await boltService.completeChallenge(userId, challengeId);
      
      const boltEndTime = Date.now();
      const boltDuration = boltEndTime - boltStartTime;
      
      if (response && response.success) {
        // Add attempt to diagnostics
        addAttempt('bolt', true, undefined, boltDuration);
        setFinalSource('bolt');
        
        // Invalidate cache
        const cacheKey = `challenges-${userId}`;
        cache.delete(cacheKey);
        
        return true;
      }
      
      // Add failed attempt to diagnostics
      addAttempt('bolt', false, 'Challenge completion failed', boltDuration);
    } catch (error) {
      const boltEndTime = Date.now();
      const boltDuration = boltEndTime - boltStartTime;
      
      // Add failed attempt to diagnostics
      addAttempt('bolt', false, error instanceof Error ? error.message : 'Unknown error', boltDuration);
      
      if (DEBUG_MODE) {
        console.error('[🧠 DataRouter] Bolt API error:', error);
      }
    }
  }
  
  // Fallback to local data
  const localStartTime = Date.now();
  
  try {
    // Simulate challenge completion
    const localEndTime = Date.now();
    const localDuration = localEndTime - localStartTime;
    
    // Add attempt to diagnostics
    addAttempt('local', true, undefined, localDuration);
    setFinalSource('local');
    
    // Invalidate cache
    const cacheKey = `challenges-${userId}`;
    cache.delete(cacheKey);
    
    return true;
  } catch (error) {
    const localEndTime = Date.now();
    const localDuration = localEndTime - localStartTime;
    
    // Add failed attempt to diagnostics
    addAttempt('local', false, error instanceof Error ? error.message : 'Unknown error', localDuration);
    
    if (DEBUG_MODE) {
      console.error('[🧠 DataRouter] Local data error:', error);
    }
    
    // Return false as last resort
    return false;
  }
}

/**
 * Get daily challenges for a user
 * @param userId - User ID
 * @returns Array of daily challenges
 */
export async function getDailyChallengesData(userId: string): Promise<any[]> {
  // Reset diagnostics
  resetDiagnostics('getDailyChallengesData');
  
  // Generate cache key
  const cacheKey = `challenges-${userId}`;
  
  // Check cache first if caching is enabled
  if (FEATURES.caching) {
    const cached = getFromCache<any[]>(cacheKey);
    if (cached) {
      return cached.data;
    }
  }
  
  // Start timing
  const startTime = Date.now();
  
  // Try Supabase first if enabled
  if (USE_SUPABASE) {
    try {
      // Fetch challenges from Supabase
      const challenges = await getDailyChallenges(userId);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      if (challenges && challenges.length > 0) {
        // Add attempt to diagnostics
        addAttempt('supabase', true, undefined, duration);
        setFinalSource('supabase');
        
        // Cache the result
        saveToCache(cacheKey, challenges, 'supabase');
        
        return challenges;
      }
      
      // Add failed attempt to diagnostics
      addAttempt('supabase', false, 'No challenges found', duration);
    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Add failed attempt to diagnostics
      addAttempt('supabase', false, error instanceof Error ? error.message : 'Unknown error', duration);
      
      if (DEBUG_MODE) {
        console.error('[🧠 DataRouter] Supabase error:', error);
      }
    }
  }
  
  // Try Bolt API if enabled
  if (USE_BOLT) {
    const boltStartTime = Date.now();
    
    try {
      // Fetch challenges from local JSON
      const response = await boltService.fetchChallenges();
      
      const boltEndTime = Date.now();
      const boltDuration = boltEndTime - boltStartTime;
      
      if (response && response.length > 0) {
        // Add attempt to diagnostics
        addAttempt('bolt', true, undefined, boltDuration);
        setFinalSource('bolt');
        
        // Cache the result
        saveToCache(cacheKey, response, 'bolt');
        
        return response;
      }
      
      // Add failed attempt to diagnostics
      addAttempt('bolt', false, 'No challenges found', boltDuration);
    } catch (error) {
      const boltEndTime = Date.now();
      const boltDuration = boltEndTime - boltStartTime;
      
      // Add failed attempt to diagnostics
      addAttempt('bolt', false, error instanceof Error ? error.message : 'Unknown error', boltDuration);
      
      if (DEBUG_MODE) {
        console.error('[🧠 DataRouter] Bolt API error:', error);
      }
    }
  }
  
  // Fallback to local data
  const localStartTime = Date.now();
  
  try {
    // Generate mock challenges
    const mockChallenges = [
      {
        id: 'mock-challenge-1',
        user_id: userId,
        challenge_id: 'view3',
        completed: false,
        created_at: new Date().toISOString()
      },
      {
        id: 'mock-challenge-2',
        user_id: userId,
        challenge_id: 'shareLook',
        completed: false,
        created_at: new Date().toISOString()
      },
      {
        id: 'mock-challenge-3',
        user_id: userId,
        challenge_id: 'saveOutfit',
        completed: false,
        created_at: new Date().toISOString()
      },
      {
        id: 'mock-challenge-4',
        user_id: userId,
        challenge_id: 'completeProfile',
        completed: false,
        created_at: new Date().toISOString()
      },
      {
        id: 'mock-challenge-5',
        user_id: userId,
        challenge_id: 'visitShop',
        completed: false,
        created_at: new Date().toISOString()
      }
    ];
    
    const localEndTime = Date.now();
    const localDuration = localEndTime - localStartTime;
    
    // Add attempt to diagnostics
    addAttempt('local', true, undefined, localDuration);
    setFinalSource('local');
    
    // Cache the result
    saveToCache(cacheKey, mockChallenges, 'local');
    
    return mockChallenges;
  } catch (error) {
    const localEndTime = Date.now();
    const localDuration = localEndTime - localStartTime;
    
    // Add failed attempt to diagnostics
    addAttempt('local', false, error instanceof Error ? error.message : 'Unknown error', localDuration);
    
    if (DEBUG_MODE) {
      console.error('[🧠 DataRouter] Local data error:', error);
    }
    
    // Return empty array as last resort
    return [];
  }
}

/**
 * Convert raw Zalando products to BoltProducts
 * @param products - Raw Zalando products
 * @returns Array of BoltProducts
 */
export async function convertZalandoToBoltProducts(products: any[]): Promise<any[]> {
  // Reset diagnostics
  resetDiagnostics('convertZalandoToBoltProducts');
  
  // Generate cache key
  const cacheKey = `zalando-to-bolt-${JSON.stringify(products.map(p => p.id))}`;
  
  // Check cache first if caching is enabled
  if (FEATURES.caching) {
    const cached = getFromCache<any[]>(cacheKey);
    if (cached) {
      return cached.data;
    }
  }
  
  try {
    // Convert products using productEnricher
    const boltProducts = enrichZalandoProducts(products);
    
    // Set data source
    setFinalSource('zalando');
    
    // Cache the result
    saveToCache(cacheKey, boltProducts, 'zalando');
    
    return boltProducts;
  } catch (error) {
    if (DEBUG_MODE) {
      console.error('[🧠 DataRouter] Error converting Zalando products:', error);
    }
    
    // Return original products as fallback
    return products;
  }
}

/**
 * Get BoltProducts
 * @returns Array of BoltProducts
 */
export async function getBoltProducts(): Promise<BoltProduct[]> {
  return loadBoltProducts();
}

// Feature flags
const FEATURES = {
  caching: true
};

export default {
  getOutfits,
  getRecommendedProducts,
  getUserData,
  getGamificationData,
  updateGamificationData,
  completeChallenge,
  getDailyChallengesData,
  convertZalandoToBoltProducts,
  getBoltProducts,
  getDataSource,
  getFetchDiagnostics,
  getFetchDiagnosticsSummary,
  clearCache
};