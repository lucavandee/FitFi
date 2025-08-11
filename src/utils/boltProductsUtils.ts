import { BoltProduct } from '../types/BoltProduct';
import { isValidImageUrl } from './imageUtils';
import dutchProducts from '../data/dutchProducts';
import { safeFetchWithFallback } from './fetchUtils';

/**
 * Utility functions for working with BoltProducts
 */

/**
 * Load BoltProducts from JSON file
 * @returns Promise that resolves to an array of BoltProducts
 */
export async function getBoltProductsFromJSON(): Promise<BoltProduct[]> {
  try {
    // Try to load from public/data/bolt/products.json with BASE_URL
    const url = `${import.meta.env.BASE_URL}data/bolt/products.json`;
    console.log(`[🧠 BoltProductsUtils] Fetching from: ${url}`);
    
    let products: BoltProduct[] = [];
    try {
      const res = await fetch(url);
      if (res.ok) {
        products = await res.json();
      } else {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
    } catch (err) {
      console.warn('[BoltProductsUtils] Could not load products.json, using fallback:', err);
      return generateMockBoltProducts();
    }
    
    if (!Array.isArray(products)) {
      console.warn('Invalid BoltProducts data: not an array');
      return generateMockBoltProducts();
    }
    
    if (products.length === 0) {
      console.log('No BoltProducts found in JSON file, generating mock products');
      return generateMockBoltProducts();
    }
    
    console.log(`Loaded ${products.length} BoltProducts from JSON file`);
    return products;
  } catch (error) {
    console.error('Error loading BoltProducts:', error);
    
    // Generate mock products as fallback
    console.log('Falling back to generating mock BoltProducts');
    return generateMockBoltProducts();
  }
}

/**
 * Generate mock BoltProducts from dutchProducts
 * @returns Array of mock BoltProducts
 */
export function generateMockBoltProducts(): BoltProduct[] {
  console.log(`Generating ${dutchProducts.length} mock BoltProducts from dutchProducts`);
  
  // Convert dutchProducts to BoltProducts
  return dutchProducts.map((product, index) => {
    // Determine product type
    const typeMapping: Record<string, any> = {
      'top': 'shirt',
      'bottom': 'broek',
      'footwear': 'schoenen',
      'accessory': 'accessoire',
      'outerwear': 'jas'
    };
    
    const type = typeMapping[product.category] || 'other';
    
    // Determine gender (alternate between male and female)
    const gender = index % 2 === 0 ? 'male' : 'female';
    
    // Determine color
    const colors = ['beige', 'black', 'blue', 'white', 'gray', 'navy', 'green', 'red'];
    const color = colors[index % colors.length];
    
    // Determine dominant color hex
    const colorHexMap: Record<string, string> = {
      'beige': '#F5F5DC',
      'black': '#000000',
      'blue': '#0000FF',
      'white': '#FFFFFF',
      'gray': '#808080'
    };
    
    const dominantColorHex = colorHexMap[color as keyof typeof colorHexMap] || '#CCCCCC';
    
    // Determine style tags
    const styleTags = product.styleTags || ['casual', 'minimal', 'versatile'];
    
    // Determine season
    const seasonMap: Record<string, string> = {
      'winter': 'winter',
      'summer': 'summer',
      'spring': 'spring',
      'autumn': 'fall'
    };
    
    const season = product.season && product.season.length > 0 
      ? (seasonMap[product.season[0] as keyof typeof seasonMap] || 'all_season')
      : 'all_season';
    
    // Determine archetype match
    const archetypeMatch: Record<string, number> = {};
    
    if (styleTags.includes('casual') || styleTags.includes('comfortable')) {
      archetypeMatch['casual_chic'] = 0.8;
    }
    
    if (styleTags.includes('formal') || styleTags.includes('elegant')) {
      archetypeMatch['klassiek'] = 0.9;
    }
    
    if (styleTags.includes('sporty') || styleTags.includes('athletic')) {
      archetypeMatch['streetstyle'] = 0.7;
    }
    
    if (styleTags.includes('vintage') || styleTags.includes('retro')) {
      archetypeMatch['retro'] = 0.85;
    }
    
    if (styleTags.includes('minimalist') || styleTags.includes('minimal')) {
      archetypeMatch['urban'] = 0.75;
    }
    
    // If no matches, add default
    if (Object.keys(archetypeMatch).length === 0) {
      archetypeMatch['casual_chic'] = 0.7;
      archetypeMatch['urban'] = 0.3;
    }
    
    // Ensure image URL is valid
    const imageUrl = isValidImageUrl(product.imageUrl) ? 
      product.imageUrl : 
      getFallbackImageForType(type as any);
    
    // Create BoltProduct
    return {
      id: `bolt-${product.id}`,
      title: product.name,
      brand: product.brand || 'FitFi Brand',
      type: type as any,
      gender: gender,
      color: color,
      dominantColorHex: dominantColorHex,
      styleTags: styleTags,
      season: season as any,
      archetypeMatch: archetypeMatch,
      material: 'Mixed materials',
      price: product.price || 49.99,
      imageUrl: imageUrl,
      affiliateUrl: (product as any).url || `https://fitfi.app/product/${product.id}?ref=bolt`,
      source: 'zalando'
    };
  });
}

/**
 * Get fallback image URL for a product type
 * @param type - Product type
 * @returns Fallback image URL
 */
function getFallbackImageForType(type: string): string {
  const fallbackImages: Record<string, string> = {
    'top': 'https://images.pexels.com/photos/5935748/pexels-photo-5935748.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
    'shirt': 'https://images.pexels.com/photos/5935748/pexels-photo-5935748.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
    'blouse': 'https://images.pexels.com/photos/5935748/pexels-photo-5935748.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
    'trui': 'https://images.pexels.com/photos/5935748/pexels-photo-5935748.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
    'broek': 'https://images.pexels.com/photos/1082529/pexels-photo-1082529.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
    'jeans': 'https://images.pexels.com/photos/1082529/pexels-photo-1082529.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
    'rok': 'https://images.pexels.com/photos/1082529/pexels-photo-1082529.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
    'schoenen': 'https://images.pexels.com/photos/267301/pexels-photo-267301.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
    'sneaker': 'https://images.pexels.com/photos/267301/pexels-photo-267301.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
    'jas': 'https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
    'tas': 'https://images.pexels.com/photos/1280064/pexels-photo-1280064.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
    'accessoire': 'https://images.pexels.com/photos/1280064/pexels-photo-1280064.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2'
  };
  
  return fallbackImages[type] || 'https://images.pexels.com/photos/5935748/pexels-photo-5935748.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2';
}

/**
 * Filter BoltProducts by gender
 * @param products - Array of BoltProducts
 * @param gender - Gender to filter by
 * @returns Filtered array of BoltProducts
 */
export function filterProductsByGender(products: BoltProduct[], gender: 'male' | 'female'): BoltProduct[] {
  return products.filter(product => product.gender === gender);
}

/**
 * Filter BoltProducts by type
 * @param products - Array of BoltProducts
 * @param type - Type to filter by
 * @returns Filtered array of BoltProducts
 */
function _filterProductsByType(products: BoltProduct[], type: string): BoltProduct[] {
  return products.filter(product => product.type === type);
}

/**
 * Filter BoltProducts by season
 * @param products - Array of BoltProducts
 * @param season - Season to filter by
 * @returns Filtered array of BoltProducts
 */
function _filterProductsBySeason(products: BoltProduct[], season: string): BoltProduct[] {
  return products.filter(product => 
    product.season === season || product.season === 'all_season'
  );
}

