import { Product, UserProfile, StylePreferences } from './types';
import { calculateMatchScore } from './calculateMatchScore';

/**
 * Filters and sorts products based on user preferences
 * 
 * @param products - Array of products to filter and sort
 * @param user - User profile with style preferences
 * @returns Filtered and sorted array of products
 */
export function filterAndSortProducts(products: Product[], user: UserProfile): Product[] {
  if (!products || !Array.isArray(products) || products.length === 0) {
    return [];
  }

  if (!user || !user.stylePreferences) {
    return products;
  }

  // Calculate match score for each product
  const productsWithScores = products.map(product => {
    const matchScore = calculateMatchScore(product, user.stylePreferences);
    return {
      ...product,
      matchScore
    };
  });

  // Filter out products with 0 score
  const filteredProducts = productsWithScores.filter(product => 
    (product.matchScore || 0) > 0
  );

  // Sort by match score (highest first)
  const sortedProducts = filteredProducts.sort((a, b) => 
    (b.matchScore || 0) - (a.matchScore || 0)
  );

  return sortedProducts;
}

/**
 * Groups products by type (category)
 * 
 * @param products - Array of products to group
 * @returns Object with product types as keys and arrays of products as values
 */
export function groupProductsByType(products: Product[]): Record<string, Product[]> {
  const groupedProducts: Record<string, Product[]> = {};

  products.forEach(product => {
    const type = product.type || 'Other';
    
    if (!groupedProducts[type]) {
      groupedProducts[type] = [];
    }
    
    groupedProducts[type].push(product);
  });

  return groupedProducts;
}

/**
 * Gets top N products for each product type
 * 
 * @param products - Array of products to process
 * @param count - Number of products to get per type
 * @returns Array of top products from each type
 */
export function getTopProductsByType(products: Product[], count: number = 2): Product[] {
  const groupedProducts = groupProductsByType(products);
  const result: Product[] = [];

  // Get top products from each type
  Object.values(groupedProducts).forEach(typeProducts => {
    // Sort by match score
    const sorted = [...typeProducts].sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    // Take top N
    result.push(...sorted.slice(0, count));
  });

  return result;
}

export default filterAndSortProducts;