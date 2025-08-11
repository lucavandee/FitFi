import { Product } from '../engine/types';
import { isValidImageUrl } from '../utils/imageUtils';
import { safeFetchWithFallback } from '../utils/fetchUtils';

/**
 * Interface for product feed data
 */
interface ProductFeedItem {
  id: string;
  name: string;
  brand: string;
  price: number;
  image_url: string;
  category: string;
  type: string;
  gender: 'male' | 'female' | 'unisex';
  colors: string[];
  sizes: string[];
  tags: string[];
  seasons: string[];
  retailer: string;
  affiliate_url: string;
  description?: string;
  in_stock: boolean;
  rating?: number;
  review_count?: number;
}

/**
 * Load product feed from JSON file
 */
export async function loadProductFeed(): Promise<Product[]> {
  try {
    const url = `${import.meta.env.BASE_URL}data/products/product_feed.json`;
    console.log(`[ProductFeedLoader] Loading from: ${url}`);
    
    const productFeedData = await safeFetchWithFallback<ProductFeedItem[]>(url, []);
    
    if (!Array.isArray(productFeedData) || productFeedData.length === 0) {
      console.warn('[ProductFeedLoader] No product feed data found');
      return [];
    }
    
    console.log(`[ProductFeedLoader] Loaded ${productFeedData.length} products from feed`);
    
    // Convert to Product format and filter valid images
    const products = productFeedData
      .filter(item => item.in_stock && isValidImageUrl(item.image_url))
      .map(item => ({
        id: item.id,
        name: item.name,
        imageUrl: item.image_url,
        type: item.type,
        category: item.category,
        styleTags: item.tags || [],
        description: item.description || `${item.name} van ${item.brand}`,
        price: item.price,
        brand: item.brand,
        affiliateUrl: item.affiliate_url,
        season: item.seasons as any[] || ['spring', 'summer', 'autumn', 'winter'],
        matchScore: 0 // Will be calculated later
      }));
    
    console.log(`[ProductFeedLoader] Converted ${products.length} valid products`);
    return products;
    
  } catch (error) {
    console.error('[ProductFeedLoader] Error loading product feed:', error);
    return [];
  }
}

/**
 * Load products with fallback chain
 */
async function loadProductsWithFallback(): Promise<Product[]> {
  // Try product feed first
  const feedProducts = await loadProductFeed();
  if (feedProducts.length > 0) {
    return feedProducts;
  }
  
  // Fallback to other sources would go here
  console.warn('[ProductFeedLoader] No products available from any source');
  return [];
}

