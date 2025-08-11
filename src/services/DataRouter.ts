
import { env } from '../utils/env';
import { UserProfile } from '../context/UserContext';
import { Outfit, Product, Season } from '../engine';
import { generateRecommendations } from '../engine/recommendationEngine';
import { generateMockGamification, generateMockOutfits, generateMockProducts } from '../utils/mockDataUtils';
import { getZalandoProducts } from '../data/zalandoProductsAdapter';
import { fetchProductsFromSupabase, getUserGamification, updateUserGamification, completeChallenge as completeSupabaseChallenge, getDailyChallenges } from './supabaseService';
import boltService from './boltService';
import { BoltProduct } from '../types/BoltProduct';
import outfitGenerator from './outfitGenerator';
import outfitEnricher from './outfitEnricher';
import { getBoltProductsFromJSON, generateMockBoltProducts, filterProductsByGender } from '../utils/boltProductsUtils';

// Data source type
type DataSource = 'supabase' | 'bolt' | 'zalando' | 'local';

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
  error?: string | undefined;
  timestamp: string;
  duration?: number | undefined;
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
let currentDataSource: DataSource = 'local'; // Default to local for testing

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

// Check if environment variables are available
const checkEnvironmentVariables = (): void => {
  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_BOLT_API_URL',
    'VITE_BOLT_API_KEY'
  ];
  
  const missingVars = requiredVars.filter(
    varName => !import.meta.env[varName] || import.meta.env[varName] === ''
  );
  
  if (missingVars.length > 0) {
    console.warn(`
[⚠️ DataRouter] Ontbrekende omgevingsvariabelen:
${missingVars.map(v => `- ${v}`).join('\n')}

Fallback-data zal worden gebruikt voor ontbrekende functionaliteit.
    `);
  }
};

// Check environment variables on module load
checkEnvironmentVariables();

/**
 * Get the current data source
 * @returns Current data source
 */
function getDataSource(): DataSource {
  return currentDataSource;
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
      if (env.DEBUG_MODE) {
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
      if (env.DEBUG_MODE) {
        console.log(`[🧠 DataRouter] Cache expired for ${key} (${Math.round(age / 1000)}s old)`);
      }
      
      // Remove expired cache
      cache.delete(key);
    }
  }
  
  return null;
      outfit.products.map(p => `${p.type || p.category} (${getProductCategory(p)})`).filter((item): item is string => typeof item === 'string').join(', ')

/**
 * Save data to cache
 * @param key - Cache key
      const structureItems = outfit.structure.filter((item): item is string => typeof item === 'string');
      console.log(`Outfit ${index + 1} structure:`, structureItems.join(', '));
 * @param source - Data source
 */
function saveToCache<T>(key: string, data: T, source: DataSource): void {
  if (!API_CONFIG.cacheTTL || !FEATURES.caching) return;
  
  cache.set(key, {
    data,
    timestamp: Date.now(),
    source
  });
  
  if (env.DEBUG_MODE) {
    console.log(`[🧠 DataRouter] Cached data for ${key} from ${source}`);
  }
}

/**
 * Load BoltProducts from API, JSON or mock
 * @returns Array of BoltProducts
 */
async function loadBoltProducts(): Promise<BoltProduct[]> {
  try {
    // ✅ 1. Gebruik cache indien beschikbaar
    if (boltProductsCache && boltProductsCache.length > 0) {
      return boltProductsCache;
    }

    // ✅ 2. Probeer BoltProducts op te halen via de Bolt API
    if (env.USE_BOLT) {
      try {
        console.log(`[🧠 DataRouter] Attempting to load BoltProducts from boltService`);
        const response = await boltService.fetchProducts();

        if (response && response.length > 0) {
          console.log(`[🧠 DataRouter] Loaded ${response.length} BoltProducts from API`);
          boltProductsCache = response;
          return response;
        }
      } catch (apiError) {
        console.error('[🧠 DataRouter] Error loading BoltProducts from API:', apiError);
      }
    }

    // ✅ 3. Probeer JSON-bestand als fallback
    console.log(`[🧠 DataRouter] Attempting to load BoltProducts from JSON file`);
    const products = await getBoltProductsFromJSON();

    if (products && products.length > 0) {
      console.log(`[🧠 DataRouter] Loaded ${products.length} BoltProducts from JSON file`);
      boltProductsCache = products;
      return products;
    }

    console.warn('[🧠 DataRouter] No BoltProducts found in JSON file');

    // ✅ 4. Gebruik mockdata als laatste redmiddel
    const mockProducts = generateMockBoltProducts();
    console.log(`[🧠 DataRouter] Generated ${mockProducts.length} mock BoltProducts as fallback`);
    boltProductsCache = mockProducts;
    return mockProducts;

  } catch (error) {
    // ❌ Fatale fout in gehele laadproces
    console.error('[🧠 DataRouter] Unexpected error loading BoltProducts:', error);

    const mockProducts = generateMockBoltProducts();
    console.log(`[🧠 DataRouter] Generated ${mockProducts.length} mock BoltProducts due to fatal error`);
    boltProductsCache = mockProducts;
    return mockProducts;
  }
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
  const safeUser = user ?? {
    id: 'anon',
    name: 'Guest',
    email: '',
    gender: 'female' as const,
    stylePreferences: { casual: 0, formal: 0, sporty: 0, vintage: 0, minimalist: 0 },
    isPremium: false,
    savedRecommendations: []
  } as UserProfile;
  console.log('[🔍 DataRouter] getRecommendedProducts called with user:', safeUser.id, 'count:', count, 'season:', season);
  
  if (env.USE_MOCK_DATA) {
    if (env.DEBUG_MODE) {
      console.log("⚠️ Using mock products via USE_MOCK_DATA");
    }
    const mockProducts = generateMockProducts(undefined, count);
    if (env.DEBUG_MODE) {
      console.log('[🔍 DataRouter] Returning mock products:', mockProducts);
    }
    return mockProducts;
  }
  // Reset diagnostics
  resetDiagnostics('getRecommendedProducts');
  
  // Generate cache key
  const cacheKey = `products-${safeUser.id}-${count}-${season || 'all'}`;
  
  // Check cache first if caching is enabled
  if (FEATURES.caching) {
    const cached = getFromCache<Product[]>(cacheKey);
    if (cached) {
      return cached.data;
    }
  }
  
  console.log('[🧠 DataRouter] Fetching recommended products');
  
  try {
    // Try to load BoltProducts
    const boltProducts = await loadBoltProducts();
    
    if (boltProducts && boltProducts.length > 0) {
      console.log(`[🧠 DataRouter] Using ${boltProducts.length} BoltProducts for recommendations`);
      
      // Filter by gender
      const genderFiltered = filterProductsByGender(boltProducts, safeUser.gender === 'male' ? 'male' : 'female');
      console.log(`[🧠 DataRouter] Filtered to ${genderFiltered.length} products matching gender: ${safeUser.gender}`);
      
      // Filter by archetype match
      const archetypeFiltered = genderFiltered.filter(product => {
        // Determine primary archetype based on user preferences
        let primaryArchetype = 'casual_chic';
        if (safeUser.stylePreferences.formal > safeUser.stylePreferences.casual) {
          primaryArchetype = 'klassiek';
        } else if (safeUser.stylePreferences.sporty > safeUser.stylePreferences.casual) {
          primaryArchetype = 'streetstyle';
        } else if (safeUser.stylePreferences.vintage > safeUser.stylePreferences.casual) {
          primaryArchetype = 'retro';
        } else if (safeUser.stylePreferences.minimalist > safeUser.stylePreferences.casual) {
          primaryArchetype = 'urban';
        }
        
        // Check if product matches archetype
        const score = product.archetypeMatch[primaryArchetype] || 0;
        return score >= 0.3; // Lower threshold to ensure we have enough products
      });
      
      // Convert to Product format
      const products = archetypeFiltered.map(p => ({
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
        season: [p.season === 'all_season' ? 'autumn' : p.season], // Convert to array
        matchScore: p.archetypeMatch['casual_chic'] || 0.5 // Default match score
      }));
      
      // Limit to requested count and ensure we have at least some products
      const limitedProducts = products.length >= count 
        ? products.slice(0, count) 
        : [...products, ...generateMockProducts(undefined, count - products.length)];
      
      // Set data source
      setFinalSource(products.length >= count ? 'bolt' : 'local');
      
      // Cache the result
      saveToCache(cacheKey, limitedProducts, getDataSource());
      
      console.log(`[🧠 DataRouter] Returning ${limitedProducts.length} recommended products`);
      return limitedProducts;
    }
    
    // If no BoltProducts, use mock products
    console.log('[🧠 DataRouter] No BoltProducts available, using mock products');
    const mockProducts = generateMockProducts(undefined, count);
    
    // Set data source
    setFinalSource('local');
    
    // Cache the result
    saveToCache(cacheKey, mockProducts, 'local');
    
    console.log(`[🧠 DataRouter] Returning ${mockProducts.length} mock products`);
    return mockProducts;
  } catch (error) {
    console.error('[🧠 DataRouter] Error getting recommended products:', error);
    
    // Use mock products as fallback
    const mockProducts = generateMockProducts(undefined, count);
    
    // Set data source
    setFinalSource('local');
    
    // Cache the result
    saveToCache(cacheKey, mockProducts, 'local');
    
    console.log(`[🧠 DataRouter] Returning ${mockProducts.length} fallback mock products after error`);
    return mockProducts;
  }
}

/**
 * Get gamification data for a user
 * @param userId - User ID
 * @returns Gamification data or null if not found
 */
async function getGamificationData(userId: string): Promise<any | null> {
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
  if (env.USE_SUPABASE) {
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
      
      if (env.DEBUG_MODE) {
        console.error('[🧠 DataRouter] Supabase error:', error);
      }
    }
  }
  
  // Try Bolt API if enabled
  if (env.USE_BOLT) {
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
      
      if (env.DEBUG_MODE) {
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
    
    if (env.DEBUG_MODE) {
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
async function updateGamificationData(userId: string, updates: any): Promise<any | null> {
  // Reset diagnostics
  resetDiagnostics('updateGamificationData');
  
  // Start timing
  const startTime = Date.now();
  
  // Try Supabase first if enabled
  if (env.USE_SUPABASE) {
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
      
      if (env.DEBUG_MODE) {
        console.error('[🧠 DataRouter] Supabase error:', error);
      }
    }
  }
  
  // Try Bolt API if enabled
  if (env.USE_BOLT) {
    const boltStartTime = Date.now();
    
    try {
      // Update gamification data (mock)
      const response = await boltService.updateGamification(userId, updates);
      
      const boltEndTime = Date.now();
      const boltDuration = boltEndTime - boltStartTime;
      
      if (response && response.success) {
        // Add attempt to diagnostics
        addAttempt('bolt', true, undefined, boltDuration);
        setFinalSource('bolt');
        
        // Update cache
        const cacheKey = `gamification-${userId}`;
        saveToCache(cacheKey, response as any, 'bolt');
        
        return response as any;
      }
      
      // Add failed attempt to diagnostics
      addAttempt('bolt', false, 'Update failed', boltDuration);
    } catch (error) {
      const boltEndTime = Date.now();
      const boltDuration = boltEndTime - boltStartTime;
      
      // Add failed attempt to diagnostics
      addAttempt('bolt', false, error instanceof Error ? error.message : 'Unknown error', boltDuration);
      
      if (env.DEBUG_MODE) {
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
    
    if (env.DEBUG_MODE) {
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
async function completeChallenge(userId: string, challengeId: string): Promise<boolean> {
  // Reset diagnostics
  resetDiagnostics('completeChallenge');
  
  // Start timing
  const startTime = Date.now();
  
  // Try Supabase first if enabled
  if (env.USE_SUPABASE) {
    try {
      // Complete challenge in Supabase
      const success = await completeSupabaseChallenge(userId, challengeId);
      
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
      
      if (env.DEBUG_MODE) {
        console.error('[🧠 DataRouter] Supabase error:', error);
      }
    }
  }
  
  // Try Bolt API if enabled
  if (env.USE_BOLT) {
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
      
      if (env.DEBUG_MODE) {
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
    
    if (env.DEBUG_MODE) {
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
async function getDailyChallengesData(userId: string): Promise<any[]> {
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
  if (env.USE_SUPABASE) {
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
      
      if (env.DEBUG_MODE) {
        console.error('[🧠 DataRouter] Supabase error:', error);
      }
    }
  }
  
  // Try Bolt API if enabled
  if (env.USE_BOLT) {
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
      
      if (env.DEBUG_MODE) {
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
    
    if (env.DEBUG_MODE) {
      console.error('[🧠 DataRouter] Local data error:', error);
    }
    
    // Return empty array as last resort
    return [];
  }
}

/**
 * Get BoltProducts
 * @returns Array of BoltProducts
 */
async function getBoltProducts(): Promise<BoltProduct[]> {
  return loadBoltProducts();
}

// Feature flags
const FEATURES = {
  caching: true // Default to true since API_CONFIG might not be available
};

// API configuration
const API_CONFIG = {
  cacheTTL: 300000 // 5 minutes in milliseconds
};

