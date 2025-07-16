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
    // Try to load from public/data/bolt/products.json first
    try {
      const products = await safeFetchWithFallback<BoltProduct[]>('/data/bolt/products.json', []);
      
      if (!Array.isArray(products)) {
        throw new Error('Invalid BoltProducts data: not an array');
      }
      
      console.log(`Loaded ${products.length} BoltProducts from public JSON file`);
      return products;
    } catch (publicError) {
      console.warn(`Could not load BoltProducts from public path: ${publicError.message}`);
      
      // Try to load from src/data/boltProducts.json as fallback
      try {
        const products = await safeFetchWithFallback<BoltProduct[]>('/src/data/boltProducts.json', []);
        
        if (!Array.isArray(products)) {
          throw new Error('Invalid BoltProducts data: not an array');
        }
        
        console.log(`Loaded ${products.length} BoltProducts from src JSON file`);
        return products;
      } catch (srcError) {
        console.warn(`Could not load BoltProducts from src path: ${srcError.message}`);
        console.log('Falling back to generating mock BoltProducts');
        
        // If both files don't exist or are invalid, generate mock products
        return generateMockBoltProducts();
      }
    }
        const products = await safeFetchWithFallback<BoltProduct[]>('/src/data/boltProducts.json', []);
        
        if (!Array.isArray(products)) {
          throw new Error('Invalid BoltProducts data: not an array');
        }
        
        console.log(`Loaded ${products.length} BoltProducts from src JSON file`);
        return products;
      } catch (srcError) {
        console.warn(`Could not load BoltProducts from src path: ${srcError.message}`);
        console.log('Falling back to generating mock BoltProducts');
        
        // If both files don't exist or are invalid, generate mock products
        return generateMockBoltProducts();
      }
    }
  } catch (error) {
    console.error('Error loading BoltProducts:', error);
    
    // Return empty array as last resort
    
    // Return empty array as last resort
    return [];
  }
}

/**
 * Generate mock BoltProducts from dutchProducts
 * @returns Array of mock BoltProducts
 */
export function generateMockBoltProducts(): BoltProduct[] {
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
    const colors = ['beige', 'black', 'blue', 'white', 'gray'];
    const color = colors[index % colors.length];
    
    // Determine dominant color hex
    const colorHexMap: Record<string, string> = {
      'beige': '#F5F5DC',
      'black': '#000000',
      'blue': '#0000FF',
      'white': '#FFFFFF',
      'gray': '#808080'
    };
    
    const dominantColorHex = colorHexMap[color] || '#CCCCCC';
    
    // Determine style tags
    const allStyleTags = ['casual', 'formal', 'sporty', 'minimal', 'street', 'elegant', 'cozy', 'vintage'];
    const styleTags = product.styleTags || allStyleTags.slice(0, 3);
    
    // Determine season
    const season = product.season?.[0] === 'winter' ? 'winter' : 
                  product.season?.[0] === 'summer' ? 'summer' : 
                  product.season?.[0] === 'spring' ? 'spring' : 
                  product.season?.[0] === 'autumn' ? 'fall' : 'all_season';
    
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
      archetypeMatch['casual_chic'] = 0.6;
    }
    
    // Ensure image URL is valid
    const imageUrl = isValidImageUrl(product.imageUrl) ? 
      product.imageUrl : 
      'https://images.pexels.com/photos/5935748/pexels-photo-5935748.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2';
    
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
      affiliateUrl: product.url || `https://example.com/product/${product.id}`,
      source: 'zalando'
    };
  });
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
export function filterProductsByType(products: BoltProduct[], type: string): BoltProduct[] {
  return products.filter(product => product.type === type);
}

/**
 * Filter BoltProducts by season
 * @param products - Array of BoltProducts
 * @param season - Season to filter by
 * @returns Filtered array of BoltProducts
 */
export function filterProductsBySeason(products: BoltProduct[], season: string): BoltProduct[] {
  return products.filter(product => 
    product.season === season || product.season === 'all_season'
  );
}

export default {
  getBoltProductsFromJSON,
  generateMockBoltProducts,
  filterProductsByGender,
  filterProductsByType,
  filterProductsBySeason
};