import { DATA_CONFIG } from '@/config/dataConfig';
import { supabase } from '@/lib/supabase';
import { BoltProduct } from '@/types/BoltProduct';
import { Outfit } from '@/engine/types';

/**
 * Data source types
 */
type DataSource = 'supabase' | 'local' | 'fallback';

/**
 * Cache interface
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  source: DataSource;
}

/**
 * Error context for debugging
 */
interface DataError {
  source: DataSource;
  operation: string;
  error: string;
  timestamp: number;
}

/**
 * Data service response
 */
interface DataServiceResponse<T> {
  data: T;
  source: DataSource;
  cached: boolean;
  errors: DataError[];
}

/**
 * Central Data Service Layer
 * Handles Supabase → Local JSON → Fallback chain with caching
 */
class DataService {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private errors: DataError[] = [];

  /**
   * Log error for debugging
   */
  private logError(source: DataSource, operation: string, error: string): void {
    const errorEntry: DataError = {
      source,
      operation,
      error,
      timestamp: Date.now()
    };
    
    this.errors.push(errorEntry);
    
    // Keep only last 50 errors
    if (this.errors.length > 50) {
      this.errors = this.errors.slice(-50);
    }
    
    console.warn(`[DataService] ${source}/${operation}: ${error}`);
  }

  /**
   * Get from cache if valid
   */
  private getFromCache<T>(key: string): CacheEntry<T> | null {
    const cached = this.cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached as CacheEntry<T>;
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
  private saveToCache<T>(key: string, data: T, source: DataSource): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      source
    });
  }

  /**
   * Fetch from Supabase
   */
  private async fetchFromSupabase<T>(
    table: string,
    query?: (q: any) => any
  ): Promise<T | null> {
    if (!DATA_CONFIG.USE_SUPABASE || !DATA_CONFIG.SUPABASE.url) {
      return null;
    }

    try {
      let supabaseQuery = supabase.from(table).select('*');
      
      if (query) {
        supabaseQuery = query(supabaseQuery);
      }
      
      const { data, error } = await supabaseQuery;
      
      if (error) {
        this.logError('supabase', `fetch_${table}`, error.message);
        return null;
      }
      
      return data as T;
    } catch (error) {
      this.logError('supabase', `fetch_${table}`, error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  }

  /**
   * Fetch from local JSON
   */
  private async fetchFromLocal<T>(path: string): Promise<T | null> {
    try {
      const response = await fetch(path);
      
      if (!response.ok) {
        this.logError('local', `fetch_${path}`, `HTTP ${response.status}`);
        return null;
      }
      
      const data = await response.json();
      return data as T;
    } catch (error) {
      this.logError('local', `fetch_${path}`, error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  }

  /**
   * Generate fallback data
   */
  private generateFallback<T>(type: 'products' | 'outfits' | 'user'): T {
    switch (type) {
      case 'products':
        return [] as T;
      case 'outfits':
        return [] as T;
      case 'user':
        return {
          id: 'fallback-user',
          name: 'Guest User',
          email: 'guest@fitfi.app',
          gender: 'female',
          stylePreferences: {
            casual: 3,
            formal: 3,
            sporty: 3,
            vintage: 3,
            minimalist: 3
          },
          isPremium: false,
          savedRecommendations: []
        } as T;
      default:
        return null as T;
    }
  }

  /**
   * Generic data fetcher with fallback chain
   */
  private async fetchWithFallback<T>(
    cacheKey: string,
    type: 'products' | 'outfits' | 'user',
    supabaseQuery?: (q: any) => any
  ): Promise<DataServiceResponse<T>> {
    const errors: DataError[] = [];
    
    // Check cache first
    const cached = this.getFromCache<T>(cacheKey);
    if (cached) {
      return {
        data: cached.data,
        source: cached.source,
        cached: true,
        errors: []
      };
    }

    // Try Supabase first
    if (DATA_CONFIG.USE_SUPABASE) {
      const supabaseTable = DATA_CONFIG.SUPABASE.tables[type as keyof typeof DATA_CONFIG.SUPABASE.tables];
      const supabaseData = await this.fetchFromSupabase<T>(supabaseTable, supabaseQuery);
      
      if (supabaseData) {
        this.saveToCache(cacheKey, supabaseData, 'supabase');
        return {
          data: supabaseData,
          source: 'supabase',
          cached: false,
          errors: []
        };
      }
    }

    // Try local JSON
    const localPath = DATA_CONFIG.LOCAL_JSON[type];
    const localData = await this.fetchFromLocal<T>(localPath);
    
    if (localData) {
      this.saveToCache(cacheKey, localData, 'local');
      return {
        data: localData,
        source: 'local',
        cached: false,
        errors: this.errors.slice(-10) // Last 10 errors
      };
    }

    // Use fallback
    const fallbackData = this.generateFallback<T>(type);
    this.saveToCache(cacheKey, fallbackData, 'fallback');
    
    return {
      data: fallbackData,
      source: 'fallback',
      cached: false,
      errors: this.errors.slice(-10)
    };
  }

  /**
   * Get products
   */
  async getProducts(filters?: {
    gender?: 'male' | 'female';
    archetype?: string;
    limit?: number;
  }): Promise<DataServiceResponse<BoltProduct[]>> {
    const cacheKey = `products_${JSON.stringify(filters || {})}`;
    
    return this.fetchWithFallback<BoltProduct[]>(
      cacheKey,
      'products',
      filters ? (query) => {
        if (filters.gender) {
          query = query.eq('gender', filters.gender);
        }
        if (filters.limit) {
          query = query.limit(filters.limit);
        }
        return query;
      } : undefined
    );
  }

  /**
   * Get outfits
   */
  async getOutfits(filters?: {
    archetype?: string;
    occasion?: string;
    limit?: number;
  }): Promise<DataServiceResponse<Outfit[]>> {
    const cacheKey = `outfits_${JSON.stringify(filters || {})}`;
    
    return this.fetchWithFallback<Outfit[]>(
      cacheKey,
      'outfits',
      filters ? (query) => {
        if (filters.archetype) {
          query = query.eq('archetype', filters.archetype);
        }
        if (filters.occasion) {
          query = query.eq('occasion', filters.occasion);
        }
        if (filters.limit) {
          query = query.limit(filters.limit);
        }
        return query;
      } : undefined
    );
  }

  /**
   * Get user data
   */
  async getUser(userId: string): Promise<DataServiceResponse<any>> {
    const cacheKey = `user_${userId}`;
    
    return this.fetchWithFallback<any>(
      cacheKey,
      'user',
      (query) => query.eq('id', userId).single()
    );
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    console.log('[DataService] Cache cleared');
  }

  /**
   * Get cache stats
   */
  getCacheStats(): {
    size: number;
    entries: Array<{ key: string; source: DataSource; age: number }>;
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
   * Get recent errors
   */
  getRecentErrors(): DataError[] {
    return this.errors.slice(-20);
  }
}

// Singleton instance
export const dataService = new DataService();