import { BoltProduct } from '../types/BoltProduct';
import { convertToBoltProducts, enrichZalandoProducts } from './productEnricher';
import { getZalandoProducts } from '../data/zalandoProductsAdapter';

/**
 * Service for converting Zalando products to BoltProducts
 * This service provides functions to fetch Zalando products and convert them to BoltProducts
 */

/**
 * Fetch Zalando products and convert them to BoltProducts
 * @returns Promise that resolves to an array of BoltProducts
 */
export async function fetchAndConvertZalandoProducts(): Promise<BoltProduct[]> {
  try {
    // Fetch Zalando products
    const zalandoProducts = await getZalandoProducts();
    
    if (!zalandoProducts || zalandoProducts.length === 0) {
      console.warn('No Zalando products found');
      return [];
    }
    
    console.log(`Found ${zalandoProducts.length} Zalando products to convert`);
    
    // Convert to BoltProducts
    const boltProducts = convertToBoltProducts(zalandoProducts);
    
    console.log(`Successfully converted ${boltProducts.length} products to BoltProduct format`);
    
    return boltProducts;
  } catch (error) {
    console.error('Error fetching and converting Zalando products:', error);
    return [];
  }
}

/**
 * Enrich existing Zalando products with BoltProduct data
 * @param products - Array of Zalando products to enrich
 * @returns Array of enriched BoltProducts
 */
export function enrichExistingZalandoProducts(products: any[]): BoltProduct[] {
  try {
    if (!products || products.length === 0) {
      console.warn('No products provided for enrichment');
      return [];
    }
    
    console.log(`Enriching ${products.length} Zalando products`);
    
    // Enrich products
    const enrichedProducts = enrichZalandoProducts(products);
    
    console.log(`Successfully enriched ${enrichedProducts.length} products`);
    
    return enrichedProducts;
  } catch (error) {
    console.error('Error enriching Zalando products:', error);
    return [];
  }
}

/**
 * Get BoltProducts for a specific gender
 * @param gender - Gender to filter by ('male' or 'female')
 * @returns Promise that resolves to an array of BoltProducts for the specified gender
 */
export async function getBoltProductsByGender(gender: 'male' | 'female'): Promise<BoltProduct[]> {
  try {
    // Fetch and convert Zalando products
    const allProducts = await fetchAndConvertZalandoProducts();
    
    // Filter by gender
    const filteredProducts = allProducts.filter(product => product.gender === gender);
    
    console.log(`Found ${filteredProducts.length} ${gender} products`);
    
    return filteredProducts;
  } catch (error) {
    console.error(`Error getting ${gender} BoltProducts:`, error);
    return [];
  }
}

/**
 * Get BoltProducts for a specific archetype
 * @param archetypeId - Archetype ID to filter by
 * @param minScore - Minimum match score (0-1)
 * @returns Promise that resolves to an array of BoltProducts for the specified archetype
 */
export async function getBoltProductsByArchetype(archetypeId: string, minScore: number = 0.5): Promise<BoltProduct[]> {
  try {
    // Fetch and convert Zalando products
    const allProducts = await fetchAndConvertZalandoProducts();
    
    // Filter by archetype match score
    const filteredProducts = allProducts.filter(product => {
      const score = product.archetypeMatch[archetypeId] || 0;
      return score >= minScore;
    });
    
    console.log(`Found ${filteredProducts.length} products matching archetype ${archetypeId} with score >= ${minScore}`);
    
    return filteredProducts;
  } catch (error) {
    console.error(`Error getting BoltProducts for archetype ${archetypeId}:`, error);
    return [];
  }
}

export default {
  fetchAndConvertZalandoProducts,
  enrichExistingZalandoProducts,
  getBoltProductsByGender,
  getBoltProductsByArchetype
};