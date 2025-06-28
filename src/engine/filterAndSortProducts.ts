import { Product, UserProfile, StylePreferences, ProductCategory } from './types';
import { calculateMatchScore } from './calculateMatchScore';
import { getProductCategory } from './helpers';

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
 * Groups products by category
 * 
 * @param products - Array of products to group
 * @returns Object with product categories as keys and arrays of products as values
 */
export function groupProductsByCategory(products: Product[]): Record<ProductCategory, Product[]> {
  const result: Record<ProductCategory, Product[]> = {} as Record<ProductCategory, Product[]>;
  
  // Initialize empty arrays for each category
  Object.values(ProductCategory).forEach(category => {
    result[category] = [];
  });
  
  // Group products by category
  products.forEach(product => {
    const category = getProductCategory(product);
    result[category].push(product);
  });
  
  return result;
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

/**
 * Gets top N products for each product category
 * 
 * @param products - Array of products to process
 * @param count - Number of products to get per category
 * @returns Array of top products from each category
 */
export function getTopProductsByCategory(products: Product[], count: number = 2): Product[] {
  const groupedProducts = groupProductsByCategory(products);
  const result: Product[] = [];

  // Get top products from each category
  Object.values(groupedProducts).forEach(categoryProducts => {
    if (categoryProducts.length === 0) return;
    
    // Sort by match score
    const sorted = [...categoryProducts].sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    // Take top N
    result.push(...sorted.slice(0, count));
  });

  return result;
}

export default filterAndSortProducts;