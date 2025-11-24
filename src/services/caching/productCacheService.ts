import { supabase } from '@/lib/supabaseClient';
import type { Product } from '@/engine/types';
import type { FilterCriteria } from '@/engine/productFiltering';

/**
 * Multi-Level Product Caching Service
 * Level 1: Memory cache (fastest, 5 min TTL)
 * Level 2: Database cache (fast, 30 min TTL)
 * Level 3: Full query (slowest, always fresh)
 */

interface CacheEntry {
  data: Product[];
  timestamp: number;
}

class ProductCacheService {
  // Level 1: In-memory cache
  private memoryCache = new Map<string, CacheEntry>();
  private readonly MEMORY_TTL = 5 * 60 * 1000; // 5 minutes

  // Level 2: Database cache TTL
  private readonly DB_CACHE_TTL = 30 * 60 * 1000; // 30 minutes

  /**
   * Get products with multi-level caching
   */
  async getProducts(criteria: FilterCriteria): Promise<Product[]> {
    const cacheKey = this.getCacheKey(criteria);

    console.log(`[ProductCache] Looking up: ${cacheKey}`);

    // Level 1: Memory cache
    const memCached = this.getFromMemory(cacheKey);
    if (memCached) {
      console.log('[ProductCache] HIT - Memory (5ms)');
      return memCached;
    }

    // Level 2: Database cache
    const dbCached = await this.getFromDatabase(cacheKey);
    if (dbCached) {
      console.log('[ProductCache] HIT - Database (50ms)');
      this.storeInMemory(cacheKey, dbCached);
      return dbCached;
    }

    // Level 3: Full query
    console.log('[ProductCache] MISS - Full query (2000ms)');
    const products = await this.queryProducts(criteria);

    // Store in all cache levels
    await this.storeInDatabase(cacheKey, products);
    this.storeInMemory(cacheKey, products);

    return products;
  }

  /**
   * Generate cache key from filter criteria
   */
  private getCacheKey(criteria: FilterCriteria): string {
    const parts = [
      'products',
      criteria.gender || 'all',
      criteria.budget?.min || 0,
      criteria.budget?.max || 9999,
      (criteria.categories || []).sort().join(',') || 'all',
      (criteria.brands || []).sort().join(',') || 'all',
      criteria.minRating || 0
    ];

    return parts.join(':');
  }

  /**
   * Get from memory cache
   */
  private getFromMemory(key: string): Product[] | null {
    const entry = this.memoryCache.get(key);
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > this.MEMORY_TTL) {
      this.memoryCache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Store in memory cache
   */
  private storeInMemory(key: string, products: Product[]): void {
    this.memoryCache.set(key, {
      data: products,
      timestamp: Date.now()
    });

    // Cleanup old entries (keep max 50)
    if (this.memoryCache.size > 50) {
      const oldestKey = this.memoryCache.keys().next().value;
      this.memoryCache.delete(oldestKey);
    }
  }

  /**
   * Get from database cache
   */
  private async getFromDatabase(key: string): Promise<Product[] | null> {
    const client = supabase();
    if (!client) return null;

    try {
      const { data, error } = await client
        .from('product_cache')
        .select('products, created_at')
        .eq('cache_key', key)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();

      if (error || !data) {
        return null;
      }

      return data.products as Product[];
    } catch (error) {
      console.error('[ProductCache] Error reading from database cache:', error);
      return null;
    }
  }

  /**
   * Store in database cache
   */
  private async storeInDatabase(key: string, products: Product[]): Promise<void> {
    const client = supabase();
    if (!client) return;

    try {
      const expiresAt = new Date(Date.now() + this.DB_CACHE_TTL).toISOString();

      const { error } = await client
        .from('product_cache')
        .upsert({
          cache_key: key,
          products: products as any,
          created_at: new Date().toISOString(),
          expires_at: expiresAt
        });

      if (error) {
        console.error('[ProductCache] Error storing in database cache:', error);
      }
    } catch (error) {
      console.error('[ProductCache] Exception storing in database cache:', error);
    }
  }

  /**
   * Query products from database (Level 3)
   */
  private async queryProducts(criteria: FilterCriteria): Promise<Product[]> {
    const client = supabase();
    if (!client) return [];

    try {
      let query = client
        .from('products')
        .select('*')
        .eq('in_stock', true);

      // Apply filters
      if (criteria.gender && criteria.gender !== 'unisex') {
        query = query.or(`gender.eq.${criteria.gender},gender.eq.unisex,gender.is.null`);
      }

      if (criteria.budget?.max) {
        query = query.lte('price', criteria.budget.max);
      }

      if (criteria.budget?.min) {
        query = query.gte('price', criteria.budget.min);
      }

      if (criteria.categories && criteria.categories.length > 0) {
        query = query.in('category', criteria.categories);
      }

      if (criteria.brands && criteria.brands.length > 0) {
        query = query.in('brand', criteria.brands);
      }

      if (criteria.minRating) {
        query = query.gte('rating', criteria.minRating);
      }

      const { data, error } = await query;

      if (error) {
        console.error('[ProductCache] Error querying products:', error);
        return [];
      }

      // Map to Product type
      const products: Product[] = (data || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        brand: p.brand,
        price: typeof p.price === 'number' ? p.price : parseFloat(p.price) || 0,
        imageUrl: p.image_url,
        category: p.category,
        type: p.type,
        gender: p.gender,
        colors: p.colors || [],
        sizes: p.sizes || [],
        tags: p.tags || [],
        retailer: p.retailer,
        affiliateUrl: p.affiliate_url,
        productUrl: p.product_url,
        description: p.description,
        inStock: p.in_stock,
        rating: p.rating,
        reviewCount: p.review_count
      }));

      return products;
    } catch (error) {
      console.error('[ProductCache] Exception querying products:', error);
      return [];
    }
  }

  /**
   * Clear all caches
   */
  clearAll(): void {
    this.memoryCache.clear();
    console.log('[ProductCache] Memory cache cleared');
  }

  /**
   * Clear specific cache key
   */
  async clearKey(criteria: FilterCriteria): Promise<void> {
    const key = this.getCacheKey(criteria);

    // Clear memory
    this.memoryCache.delete(key);

    // Clear database
    const client = supabase();
    if (client) {
      await client
        .from('product_cache')
        .delete()
        .eq('cache_key', key);
    }

    console.log(`[ProductCache] Cleared key: ${key}`);
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    memorySize: number;
    memoryKeys: string[];
  } {
    return {
      memorySize: this.memoryCache.size,
      memoryKeys: Array.from(this.memoryCache.keys())
    };
  }
}

export const productCacheService = new ProductCacheService();

// Cleanup job: Clear expired database cache entries
export async function cleanupExpiredCache(): Promise<void> {
  const client = supabase();
  if (!client) return;

  const { error } = await client
    .from('product_cache')
    .delete()
    .lt('expires_at', new Date().toISOString());

  if (error) {
    console.error('[ProductCache] Error cleaning up expired cache:', error);
  } else {
    console.log('[ProductCache] Cleaned up expired database cache');
  }
}
