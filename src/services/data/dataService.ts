import { DATA_CONFIG } from "@/config/dataConfig";
import { buildAffiliateUrl } from "@/services/affiliateLinkBuilder";
import type { BoltProduct, Outfit, FitFiUserProfile, Tribe, TribePost, DataResponse, CacheEntry, DataServiceConfig, DataError } from "./types";
import type { TribeChallenge, TribeChallengeSubmission, TribeRanking } from "./types";
import { getLocalProducts, getLocalOutfits, getLocalUser, getLocalTribes } from "./localSource";
import { getSbProducts, getSbOutfits, getSbUser, getSbTribes, getSbTribeBySlug, getSbTribePosts, getSbTribeChallenges, getSbChallengeSubmissions, createSbChallengeSubmission, getSbTribeRankings } from "./supabaseSource";
import { getLocalTribeChallenges, getLocalChallengeSubmissions, createLocalChallengeSubmission, getLocalTribeRankings } from "./localSource";

/**
 * Enterprise Data Service Orchestrator
 * Manages fallback chain, caching, affiliate mapping, and error handling
 */
class DataServiceOrchestrator {
  private cache = new Map<string, CacheEntry<any>>();
  private errors: DataError[] = [];
  private config: DataServiceConfig = {
    cacheTTL: 5 * 60 * 1000, // 5 minutes
    maxCacheSize: 100,
    enableFallbacks: true,
    logErrors: true,
    retryAttempts: 2,
    retryDelay: 1000
  };

  /**
   * Log error with context
   */
  private logError(
    source: 'supabase' | 'local' | 'fallback',
    operation: string,
    error: string,
    context?: Record<string, any>
  ): void {
    const errorEntry: DataError = {
      source,
      operation,
      error,
      timestamp: Date.now(),
      context
    };
    
    this.errors.push(errorEntry);
    
    // Keep only last 50 errors
    if (this.errors.length > 50) {
      this.errors = this.errors.slice(-50);
    }
    
    if (this.config.logErrors) {
      console.warn(`[DataService] ${source}/${operation}: ${error}`, context);
    }
  }

  /**
   * Get from cache if valid
   */
  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data as T;
    }
    
    // Remove expired cache
    if (cached) {
      this.cache.delete(key);
    }
    
    return null;
  }

  /**
   * Save to cache
   */
  private saveToCache<T>(key: string, data: T, source: 'supabase' | 'local' | 'fallback'): void {
    // Cleanup old entries if cache is full
    if (this.cache.size >= this.config.maxCacheSize) {
      const oldestKey = Array.from(this.cache.keys())[0];
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      source,
      ttl: this.config.cacheTTL
    });
  }

  /**
   * Map affiliate links to products
   */
  private mapAffiliate(p: BoltProduct): BoltProduct {
    if (!p?.productUrl) return p;
    
    try {
      const provider = (p.provider ?? "generic") as any;
      const enhancedUrl = buildAffiliateUrl(p.productUrl, provider);
      
      return { 
        ...p, 
        productUrl: enhancedUrl,
        // Add tracking metadata
        affiliateProvider: provider,
        trackingAdded: true
      };
    } catch (error) {
      this.logError('affiliate', 'map_affiliate', `Failed to map affiliate for product ${p.id}`, { productId: p.id });
      return p; // Return original product if affiliate mapping fails
    }
  }

  /**
   * Execute operation with retry logic
   */
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationName: string,
    source: 'supabase' | 'local'
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= this.config.retryAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < this.config.retryAttempts) {
          this.logError(source, operationName, `Attempt ${attempt + 1} failed, retrying...`, { error: lastError.message });
          await new Promise(resolve => setTimeout(resolve, this.config.retryDelay * (attempt + 1)));
        }
      }
    }
    
    throw lastError!;
  }

  /**
   * Fetch products with fallback chain
   */
  async fetchProducts(filters?: {
    gender?: "male" | "female" | "unisex";
    category?: string;
    limit?: number;
  }): Promise<DataResponse<BoltProduct[]>> {
    const cacheKey = `products_${JSON.stringify(filters || {})}`;
    
    // Check cache first
    const cached = this.getFromCache<BoltProduct[]>(cacheKey);
    if (cached) {
      return {
        data: cached,
        source: 'local', // Cache source is abstracted
        cached: true,
        timestamp: Date.now()
      };
    }

    // Try Supabase first
    if (DATA_CONFIG.USE_SUPABASE) {
      try {
        const sb = await this.executeWithRetry(
          () => getSbProducts(filters),
          'fetch_products',
          'supabase'
        );
        
        if (sb && sb.length > 0) {
          const productsWithAffiliate = sb.map(this.mapAffiliate.bind(this));
          this.saveToCache(cacheKey, productsWithAffiliate, 'supabase');
          
          return {
            data: productsWithAffiliate,
            source: 'supabase',
            cached: false,
            timestamp: Date.now()
          };
        }
      } catch (error) {
        this.logError('supabase', 'fetch_products', (error as Error).message, { filters });
      }
    }

    // Fallback to local
    try {
      const local = await this.executeWithRetry(
        () => getLocalProducts(),
        'fetch_products',
        'local'
      );
      
      const productsWithAffiliate = local.map(this.mapAffiliate.bind(this));
      this.saveToCache(cacheKey, productsWithAffiliate, 'local');
      
      return {
        data: productsWithAffiliate,
        source: 'local',
        cached: false,
        timestamp: Date.now(),
        errors: this.getRecentErrors()
      };
    } catch (error) {
      this.logError('local', 'fetch_products', (error as Error).message, { filters });
      
      // Final fallback to empty array
      return {
        data: [],
        source: 'fallback',
        cached: false,
        timestamp: Date.now(),
        errors: this.getRecentErrors()
      };
    }
  }

  /**
   * Fetch outfits with fallback chain
   */
  async fetchOutfits(filters?: {
    archetype?: string;
    season?: "spring" | "summer" | "autumn" | "winter" | "all";
    limit?: number;
  }): Promise<DataResponse<Outfit[]>> {
    const cacheKey = `outfits_${JSON.stringify(filters || {})}`;
    
    // Check cache first
    const cached = this.getFromCache<Outfit[]>(cacheKey);
    if (cached) {
      return {
        data: cached,
        source: 'local',
        cached: true,
        timestamp: Date.now()
      };
    }

    // Try Supabase first
    if (DATA_CONFIG.USE_SUPABASE) {
      try {
        const sb = await this.executeWithRetry(
          () => getSbOutfits(filters),
          'fetch_outfits',
          'supabase'
        );
        
        if (sb && sb.length > 0) {
          this.saveToCache(cacheKey, sb, 'supabase');
          
          return {
            data: sb,
            source: 'supabase',
            cached: false,
            timestamp: Date.now()
          };
        }
      } catch (error) {
        this.logError('supabase', 'fetch_outfits', (error as Error).message, { filters });
      }
    }

    // Fallback to local
    try {
      const local = await this.executeWithRetry(
        () => getLocalOutfits(),
        'fetch_outfits',
        'local'
      );
      
      this.saveToCache(cacheKey, local, 'local');
      
      return {
        data: local,
        source: 'local',
        cached: false,
        timestamp: Date.now(),
        errors: this.getRecentErrors()
      };
    } catch (error) {
      this.logError('local', 'fetch_outfits', (error as Error).message, { filters });
      
      // Final fallback to empty array
      return {
        data: [],
        source: 'fallback',
        cached: false,
        timestamp: Date.now(),
        errors: this.getRecentErrors()
      };
    }
  }

  /**
   * Fetch user with fallback chain
   */
  async fetchUser(userId?: string): Promise<DataResponse<FitFiUserProfile | null>> {
    if (!userId) {
      return {
        data: null,
        source: 'fallback',
        cached: false,
        timestamp: Date.now()
      };
    }

    const cacheKey = `user_${userId}`;
    
    // Check cache first
    const cached = this.getFromCache<FitFiUserProfile>(cacheKey);
    if (cached) {
      return {
        data: cached,
        source: 'local',
        cached: true,
        timestamp: Date.now()
      };
    }

    // Try Supabase first
    if (DATA_CONFIG.USE_SUPABASE) {
      try {
        const sb = await this.executeWithRetry(
          () => getSbUser(userId),
          'fetch_user',
          'supabase'
        );
        
        if (sb) {
          this.saveToCache(cacheKey, sb, 'supabase');
          
          return {
            data: sb,
            source: 'supabase',
            cached: false,
            timestamp: Date.now()
          };
        }
      } catch (error) {
        this.logError('supabase', 'fetch_user', (error as Error).message, { userId });
      }
    }

    // Fallback to local
    try {
      const local = await this.executeWithRetry(
        () => getLocalUser(),
        'fetch_user',
        'local'
      );
      
      this.saveToCache(cacheKey, local, 'local');
      
      return {
        data: local,
        source: 'local',
        cached: false,
        timestamp: Date.now(),
        errors: this.getRecentErrors()
      };
    } catch (error) {
      this.logError('local', 'fetch_user', (error as Error).message, { userId });
      
      // Final fallback to null
      return {
        data: null,
        source: 'fallback',
        cached: false,
        timestamp: Date.now(),
        errors: this.getRecentErrors()
      };
    }
  }

  /**
   * Fetch tribes with fallback chain
   */
  async fetchTribes(filters?: {
    featured?: boolean;
    archetype?: string;
    limit?: number;
  }): Promise<DataResponse<Tribe[]>> {
    const cacheKey = `tribes_${JSON.stringify(filters || {})}`;
    
    // Check cache first
    const cached = this.getFromCache<Tribe[]>(cacheKey);
    if (cached) {
      return {
        data: cached,
        source: 'local',
        cached: true,
        timestamp: Date.now()
      };
    }

    // Try Supabase first
    if (DATA_CONFIG.USE_SUPABASE) {
      try {
        const sb = await this.executeWithRetry(
          () => getSbTribes(filters),
          'fetch_tribes',
          'supabase'
        );
        
        if (sb && sb.length > 0) {
          this.saveToCache(cacheKey, sb, 'supabase');
          
          return {
            data: sb,
            source: 'supabase',
            cached: false,
            timestamp: Date.now()
          };
        }
        
        // If Supabase returns empty array, still cache it
        if (sb && sb.length === 0) {
          this.saveToCache(cacheKey, sb, 'supabase');
          
          return {
            data: sb,
            source: 'supabase',
            cached: false,
            timestamp: Date.now()
          };
        }
      } catch (error) {
        this.logError('supabase', 'fetch_tribes', (error as Error).message, { filters });
      }
    }

    // Fallback to local
    try {
      const local = await this.executeWithRetry(
        () => getLocalTribes(),
        'fetch_tribes',
        'local'
      );
      
      this.saveToCache(cacheKey, local, 'local');
      
      return {
        data: local,
        source: 'local',
        cached: false,
        timestamp: Date.now(),
        errors: this.getRecentErrors()
      };
    } catch (error) {
      this.logError('local', 'fetch_tribes', (error as Error).message, { filters });
      
      // Final fallback to empty array
      return {
        data: [],
        source: 'fallback',
        cached: false,
        timestamp: Date.now(),
        errors: this.getRecentErrors()
      };
    }
  }

  /**
   * Fetch tribe by slug with fallback chain
   */
  async fetchTribeBySlug(slug: string, userId?: string): Promise<DataResponse<Tribe | null>> {
    const cacheKey = `tribe_${slug}_${userId || 'anon'}`;
    
    // Check cache first
    const cached = this.getFromCache<Tribe>(cacheKey);
    if (cached) {
      return {
        data: cached,
        source: 'local',
        cached: true,
        timestamp: Date.now()
      };
    }

    // Try Supabase first
    if (DATA_CONFIG.USE_SUPABASE) {
      try {
        const sb = await this.executeWithRetry(
          () => getSbTribeBySlug(slug, userId),
          'fetch_tribe_by_slug',
          'supabase'
        );
        
        if (sb) {
          this.saveToCache(cacheKey, sb, 'supabase');
          
          return {
            data: sb,
            source: 'supabase',
            cached: false,
            timestamp: Date.now()
          };
        }
      } catch (error) {
        this.logError('supabase', 'fetch_tribe_by_slug', (error as Error).message, { slug, userId });
      }
    }

    // Fallback to local tribes
    try {
      const localTribes = await this.executeWithRetry(
        () => getLocalTribes(),
        'fetch_tribe_by_slug',
        'local'
      );
      
      const tribe = localTribes.find(t => t.slug === slug);
      
      if (tribe) {
        this.saveToCache(cacheKey, tribe, 'local');
        
        return {
          data: tribe,
          source: 'local',
          cached: false,
          timestamp: Date.now()
        };
      }
      
      return {
        data: null,
        source: 'local',
        cached: false,
        timestamp: Date.now(),
        errors: this.getRecentErrors()
      };
    } catch (error) {
      this.logError('local', 'fetch_tribe_by_slug', (error as Error).message, { slug, userId });
      
      return {
        data: null,
        source: 'fallback',
        cached: false,
        timestamp: Date.now(),
        errors: this.getRecentErrors()
      };
    }
  }

  /**
   * Fetch tribe posts with fallback chain
   */
  async fetchTribePosts(
    tribeId: string,
    options?: {
      limit?: number;
      offset?: number;
      userId?: string;
    }
  ): Promise<DataResponse<TribePost[]>> {
    const cacheKey = `tribe_posts_${tribeId}_${JSON.stringify(options || {})}`;
    
    // Check cache first
    const cached = this.getFromCache<TribePost[]>(cacheKey);
    if (cached) {
      return {
        data: cached,
        source: 'local',
        cached: true,
        timestamp: Date.now()
      };
    }

    // Try Supabase first
    if (DATA_CONFIG.USE_SUPABASE) {
      try {
        const sb = await this.executeWithRetry(
          () => getSbTribePosts(tribeId, options),
          'fetch_tribe_posts',
          'supabase'
        );
        
        if (sb && sb.length >= 0) { // Allow empty arrays
          this.saveToCache(cacheKey, sb, 'supabase');
          
          return {
            data: sb,
            source: 'supabase',
            cached: false,
            timestamp: Date.now()
          };
        }
      } catch (error) {
        this.logError('supabase', 'fetch_tribe_posts', (error as Error).message, { tribeId, options });
      }
    }

    // Fallback to local tribe data (get recent_posts from tribe)
    try {
      const localTribes = await this.executeWithRetry(
        () => getLocalTribes(),
        'fetch_tribe_posts',
        'local'
      );
      
      const tribe = localTribes.find(t => t.id === tribeId);
      const posts = tribe?.recent_posts || [];
      
      this.saveToCache(cacheKey, posts, 'local');
      
      return {
        data: posts,
        source: 'local',
        cached: false,
        timestamp: Date.now(),
        errors: this.getRecentErrors()
      };
    } catch (error) {
      this.logError('local', 'fetch_tribe_posts', (error as Error).message, { tribeId, options });
      
      // Final fallback to empty array
      return {
        data: [],
        source: 'fallback',
        cached: false,
        timestamp: Date.now(),
        errors: this.getRecentErrors()
      };
    }
  }
  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    console.log('[DataService] Cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number;
    entries: Array<{ key: string; source: string; age: number }>;
  } {
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      source: entry.source,
      age: Date.now() - entry.timestamp
    }));

    return {
      size: this.cache.size,
      entries
    };
  }

  /**
   * Fetch tribe challenges with fallback chain
   */
  async fetchTribeChallenges(
    tribeId: string,
    options?: {
      status?: "draft" | "open" | "closed" | "archived";
      limit?: number;
    }
  ): Promise<DataResponse<TribeChallenge[]>> {
    const cacheKey = `tribe_challenges_${tribeId}_${JSON.stringify(options || {})}`;
    
    // Check cache first
    const cached = this.getFromCache<TribeChallenge[]>(cacheKey);
    if (cached) {
      return {
        data: cached,
        source: 'local',
        cached: true,
        timestamp: Date.now()
      };
    }

    // Try Supabase first
    if (DATA_CONFIG.USE_SUPABASE) {
      try {
        const sb = await this.executeWithRetry(
          () => getSbTribeChallenges(tribeId, options),
          'fetch_tribe_challenges',
          'supabase'
        );
        
        if (sb && sb.length >= 0) {
          this.saveToCache(cacheKey, sb, 'supabase');
          
          return {
            data: sb,
            source: 'supabase',
            cached: false,
            timestamp: Date.now()
          };
        }
      } catch (error) {
        this.logError('supabase', 'fetch_tribe_challenges', (error as Error).message, { tribeId, options });
      }
    }

    // Fallback to local
    try {
      const local = await this.executeWithRetry(
        () => getLocalTribeChallenges(tribeId, options),
        'fetch_tribe_challenges',
        'local'
      );
      
      this.saveToCache(cacheKey, local, 'local');
      
      return {
        data: local,
        source: 'local',
        cached: false,
        timestamp: Date.now(),
        errors: this.getRecentErrors()
      };
    } catch (error) {
      this.logError('local', 'fetch_tribe_challenges', (error as Error).message, { tribeId, options });
      
      return {
        data: [],
        source: 'fallback',
        cached: false,
        timestamp: Date.now(),
        errors: this.getRecentErrors()
      };
    }
  }

  /**
   * Fetch challenge submissions with fallback chain
   */
  async fetchChallengeSubmissions(
    challengeId: string,
    options?: {
      userId?: string;
      limit?: number;
    }
  ): Promise<DataResponse<TribeChallengeSubmission[]>> {
    const cacheKey = `challenge_submissions_${challengeId}_${JSON.stringify(options || {})}`;
    
    // Check cache first
    const cached = this.getFromCache<TribeChallengeSubmission[]>(cacheKey);
    if (cached) {
      return {
        data: cached,
        source: 'local',
        cached: true,
        timestamp: Date.now()
      };
    }

    // Try Supabase first
    if (DATA_CONFIG.USE_SUPABASE) {
      try {
        const sb = await this.executeWithRetry(
          () => getSbChallengeSubmissions(challengeId, options),
          'fetch_challenge_submissions',
          'supabase'
        );
        
        if (sb && sb.length >= 0) {
          this.saveToCache(cacheKey, sb, 'supabase');
          
          return {
            data: sb,
            source: 'supabase',
            cached: false,
            timestamp: Date.now()
          };
        }
      } catch (error) {
        this.logError('supabase', 'fetch_challenge_submissions', (error as Error).message, { challengeId, options });
      }
    }

    // Fallback to local
    try {
      const local = await this.executeWithRetry(
        () => getLocalChallengeSubmissions(challengeId, options),
        'fetch_challenge_submissions',
        'local'
      );
      
      this.saveToCache(cacheKey, local, 'local');
      
      return {
        data: local,
        source: 'local',
        cached: false,
        timestamp: Date.now(),
        errors: this.getRecentErrors()
      };
    } catch (error) {
      this.logError('local', 'fetch_challenge_submissions', (error as Error).message, { challengeId, options });
      
      return {
        data: [],
        source: 'fallback',
        cached: false,
        timestamp: Date.now(),
        errors: this.getRecentErrors()
      };
    }
  }

  /**
   * Create challenge submission with fallback
   */
  async createChallengeSubmission(
    submission: Omit<TribeChallengeSubmission, 'id' | 'createdAt'>
  ): Promise<DataResponse<TribeChallengeSubmission>> {
    // Try Supabase first
    if (DATA_CONFIG.USE_SUPABASE) {
      try {
        const sb = await this.executeWithRetry(
          () => createSbChallengeSubmission(submission),
          'create_challenge_submission',
          'supabase'
        );
        
        if (sb) {
          return {
            data: sb,
            source: 'supabase',
            cached: false,
            timestamp: Date.now()
          };
        }
      } catch (error) {
        this.logError('supabase', 'create_challenge_submission', (error as Error).message, { submission });
      }
    }

    // Fallback to local
    try {
      const local = await this.executeWithRetry(
        () => createLocalChallengeSubmission(submission),
        'create_challenge_submission',
        'local'
      );
      
      return {
        data: local,
        source: 'local',
        cached: false,
        timestamp: Date.now(),
        errors: this.getRecentErrors()
      };
    } catch (error) {
      this.logError('local', 'create_challenge_submission', (error as Error).message, { submission });
      
      throw error;
    }
  }

  /**
   * Fetch tribe rankings with fallback chain
   */
  async fetchTribeRankings(
    options?: {
      limit?: number;
      userId?: string;
      tribeId?: string;
    }
  ): Promise<DataResponse<TribeRanking[]>> {
    const cacheKey = `tribe_rankings_${JSON.stringify(options || {})}`;
    
    // Check cache first
    const cached = this.getFromCache<TribeRanking[]>(cacheKey);
    if (cached) {
      return {
        data: cached,
        source: 'local',
        cached: true,
        timestamp: Date.now()
      };
    }

    // Try Supabase first
    if (DATA_CONFIG.USE_SUPABASE) {
      try {
        const sb = await this.executeWithRetry(
          () => getSbTribeRankings(options),
          'fetch_tribe_rankings',
          'supabase'
        );
        
        if (sb && sb.length >= 0) {
          this.saveToCache(cacheKey, sb, 'supabase');
          
          return {
            data: sb,
            source: 'supabase',
            cached: false,
            timestamp: Date.now()
          };
        }
      } catch (error) {
        this.logError('supabase', 'fetch_tribe_rankings', (error as Error).message, { options });
      }
    }

    // Fallback to local
    try {
      const local = await this.executeWithRetry(
        () => getLocalTribeRankings(options),
        'fetch_tribe_rankings',
        'local'
      );
      
      this.saveToCache(cacheKey, local, 'local');
      
      return {
        data: local,
        source: 'local',
        cached: false,
        timestamp: Date.now(),
        errors: this.getRecentErrors()
      };
    } catch (error) {
      this.logError('local', 'fetch_tribe_rankings', (error as Error).message, { options });
      
      return {
        data: [],
        source: 'fallback',
        cached: false,
        timestamp: Date.now(),
        errors: this.getRecentErrors()
      };
    }
  }

  /**
   * Get recent errors
   */
  getRecentErrors(): DataError[] {
    return this.errors.slice(-20);
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<DataServiceConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Health check for all data sources
   */
  async healthCheck(): Promise<{
    supabase: { healthy: boolean; responseTime?: number; error?: string };
    local: { healthy: boolean; responseTime?: number; error?: string };
  }> {
    const results = {
      supabase: { healthy: false, responseTime: 0, error: '' },
      local: { healthy: false, responseTime: 0, error: '' }
    };

    // Check Supabase
    if (DATA_CONFIG.USE_SUPABASE) {
      const startTime = Date.now();
      try {
        await getSbProducts();
        results.supabase = {
          healthy: true,
          responseTime: Date.now() - startTime
        };
      } catch (error) {
        results.supabase = {
          healthy: false,
          responseTime: Date.now() - startTime,
          error: (error as Error).message
        };
      }
    }

    // Check Local
    const localStartTime = Date.now();
    try {
      await getLocalProducts();
      results.local = {
        healthy: true,
        responseTime: Date.now() - localStartTime,
        error: ''
      };
    } catch (error) {
      results.local = {
        healthy: false,
        responseTime: Date.now() - localStartTime,
        error: (error as Error).message
      };
    }

    return results;
  }
}

// Singleton instance
const dataServiceOrchestrator = new DataServiceOrchestrator();

// Export orchestrator methods
export async function fetchProducts(filters?: {
  gender?: "male" | "female" | "unisex";
  category?: string;
  limit?: number;
}): Promise<DataResponse<BoltProduct[]>> {
  return dataServiceOrchestrator.fetchProducts(filters);
}

export async function fetchOutfits(filters?: {
  archetype?: string;
  season?: "spring" | "summer" | "autumn" | "winter" | "all";
  limit?: number;
}): Promise<DataResponse<Outfit[]>> {
  return dataServiceOrchestrator.fetchOutfits(filters);
}

export async function fetchUser(userId?: string): Promise<DataResponse<FitFiUserProfile | null>> {
  return dataServiceOrchestrator.fetchUser(userId);
}

export async function fetchTribes(filters?: {
  featured?: boolean;
  archetype?: string;
  limit?: number;
}): Promise<DataResponse<Tribe[]>> {
  return dataServiceOrchestrator.fetchTribes(filters);
}

export async function fetchTribeBySlug(slug: string, userId?: string): Promise<DataResponse<Tribe | null>> {
  return dataServiceOrchestrator.fetchTribeBySlug(slug, userId);
}

export async function fetchTribePosts(
  tribeId: string,
  options?: {
    limit?: number;
    offset?: number;
    userId?: string;
  }
): Promise<DataResponse<TribePost[]>> {
  return dataServiceOrchestrator.fetchTribePosts(tribeId, options);
}

export async function fetchTribeChallenges(
  tribeId: string,
  options?: {
    status?: "draft" | "open" | "closed" | "archived";
    limit?: number;
  }
): Promise<DataResponse<TribeChallenge[]>> {
  return dataServiceOrchestrator.fetchTribeChallenges(tribeId, options);
}

export async function fetchChallengeSubmissions(
  challengeId: string,
  options?: {
    userId?: string;
    limit?: number;
  }
): Promise<DataResponse<TribeChallengeSubmission[]>> {
  return dataServiceOrchestrator.fetchChallengeSubmissions(challengeId, options);
}

export async function createChallengeSubmission(
  submission: Omit<TribeChallengeSubmission, 'id' | 'createdAt'>
): Promise<DataResponse<TribeChallengeSubmission>> {
  return dataServiceOrchestrator.createChallengeSubmission(submission);
}

export async function fetchTribeRankings(
  options?: {
    limit?: number;
    userId?: string;
    tribeId?: string;
  }
): Promise<DataResponse<TribeRanking[]>> {
  return dataServiceOrchestrator.fetchTribeRankings(options);
}

// Export utility methods
export const clearCache = () => dataServiceOrchestrator.clearCache();
export const getCacheStats = () => dataServiceOrchestrator.getCacheStats();
export const getRecentErrors = () => dataServiceOrchestrator.getRecentErrors();
export const healthCheck = () => dataServiceOrchestrator.healthCheck();
export const updateConfig = (updates: Partial<DataServiceConfig>) => dataServiceOrchestrator.updateConfig(updates);

// Map affiliate links to products
function mapAffiliate(p: BoltProduct): BoltProduct {
  if (!p?.productUrl) return p;
  
  try {
    const provider = (p.provider ?? "generic") as any;
    const enhancedUrl = buildAffiliateUrl(p.productUrl, provider);
    
    return { 
      ...p, 
      productUrl: enhancedUrl,
      // Add tracking metadata
      affiliateProvider: provider,
      trackingAdded: true,
      enhancedAt: Date.now()
    };
  } catch (error) {
    console.warn(`[DataService] Failed to map affiliate for product ${p.id}:`, error);
    return p; // Return original product if affiliate mapping fails
  }
}

// Export singleton for direct access
export { dataServiceOrchestrator as dataService };