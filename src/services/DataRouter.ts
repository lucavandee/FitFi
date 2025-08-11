import { env } from '../utils/env';
import { UserProfile } from '../context/UserContext';
import { Outfit, Product, Season } from '../engine';
import { generateMockOutfits } from '@/utils/mockOutfits';
import { rankOutfits, ensureDiversity } from '@/engine/ranking';
import { dataService } from './DataService';
import { useProducts } from '@/hooks/useProducts';
import { useOutfitsData } from '@/hooks/useOutfitsData';
import { generateMockProducts } from '../utils/mockDataUtils';

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
  
  try {
    // Use new data service
    const response = await dataService.getProducts({
      gender: user?.gender === 'male' ? 'male' : 'female',
      limit: count
    });
    
    if (response.data && response.data.length > 0) {
      // Convert BoltProducts to Product format
      const products = response.data.map(p => ({
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
        season: [p.season === 'all_season' ? 'autumn' : p.season],
        matchScore: 0.8 // Default match score
      }));
      
      console.log(`[🧠 DataRouter] Returning ${products.length} products from ${response.source}`);
      return products.slice(0, count);
    }
    
    // Fallback to mock products
    console.log('[🧠 DataRouter] No products available, using mock products');
    const mockProducts = generateMockProducts(undefined, count);
    return mockProducts;
    
  } catch (error) {
    console.error('[🧠 DataRouter] Error getting recommended products:', error);
    const mockProducts = generateMockProducts(undefined, count);
    return mockProducts;
  }
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