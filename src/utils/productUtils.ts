import { BoltProduct } from '../types/BoltProduct';

/**
 * Utility functions for working with BoltProducts
 */

/**
 * Group BoltProducts by type
 * @param products - Array of BoltProducts
 * @returns Object with product types as keys and arrays of products as values
 */
export function groupProductsByType(products: BoltProduct[]): Record<string, BoltProduct[]> {
  return products.reduce((groups, product) => {
    const type = product.type;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(product);
    return groups;
  }, {} as Record<string, BoltProduct[]>);
}

/**
 * Group BoltProducts by archetype
 * @param products - Array of BoltProducts
 * @param minScore - Minimum match score (0-1)
 * @returns Object with archetype IDs as keys and arrays of products as values
 */
export function groupProductsByArchetype(products: BoltProduct[], minScore: number = 0.5): Record<string, BoltProduct[]> {
  const groups: Record<string, BoltProduct[]> = {};
  
  products.forEach(product => {
    Object.entries(product.archetypeMatch).forEach(([archetypeId, score]) => {
      if (score >= minScore) {
        if (!groups[archetypeId]) {
          groups[archetypeId] = [];
        }
        groups[archetypeId].push(product);
      }
    });
  });
  
  return groups;
}

/**
 * Group BoltProducts by season
 * @param products - Array of BoltProducts
 * @returns Object with seasons as keys and arrays of products as values
 */
export function groupProductsBySeason(products: BoltProduct[]): Record<string, BoltProduct[]> {
  return products.reduce((groups, product) => {
    const season = product.season;
    if (!groups[season]) {
      groups[season] = [];
    }
    groups[season].push(product);
    return groups;
  }, {} as Record<string, BoltProduct[]>);
}

/**
 * Filter BoltProducts by style tags
 * @param products - Array of BoltProducts
 * @param tags - Array of style tags to filter by
 * @returns Array of BoltProducts that have at least one of the specified tags
 */
export function filterProductsByStyleTags(products: BoltProduct[], tags: string[]): BoltProduct[] {
  return products.filter(product => 
    product.styleTags.some(tag => tags.includes(tag))
  );
}

/**
 * Sort BoltProducts by archetype match score
 * @param products - Array of BoltProducts
 * @param archetypeId - Archetype ID to sort by
 * @returns Array of BoltProducts sorted by match score (descending)
 */
export function sortProductsByArchetypeMatch(products: BoltProduct[], archetypeId: string): BoltProduct[] {
  return [...products].sort((a, b) => {
    const scoreA = a.archetypeMatch[archetypeId] || 0;
    const scoreB = b.archetypeMatch[archetypeId] || 0;
    return scoreB - scoreA;
  });
}

/**
 * Get top products for each type
 * @param products - Array of BoltProducts
 * @param count - Number of products to get per type
 * @returns Array of top products from each type
 */
export function getTopProductsByType(products: BoltProduct[], count: number = 2): BoltProduct[] {
  const groupedProducts = groupProductsByType(products);
  const result: BoltProduct[] = [];
  
  Object.values(groupedProducts).forEach(typeProducts => {
    result.push(...typeProducts.slice(0, count));
  });
  
  return result;
}

/**
 * Create outfit combinations from BoltProducts
 * @param products - Array of BoltProducts
 * @param archetypeId - Archetype ID to match
 * @returns Array of outfit combinations (arrays of products)
 */
export function createOutfitCombinations(products: BoltProduct[], archetypeId: string): BoltProduct[][] {
  // Group products by type
  const groupedProducts = groupProductsByType(products);
  
  // Essential product types for an outfit
  const essentialTypes = ['top', 'broek', 'schoenen'];
  
  // Optional product types
  const optionalTypes = ['jas', 'accessoire', 'tas'];
  
  // Check if we have products for all essential types
  const hasAllEssentials = essentialTypes.every(type => 
    groupedProducts[type] && groupedProducts[type].length > 0
  );
  
  if (!hasAllEssentials) {
    console.warn('Missing essential product types for outfit combinations');
    return [];
  }
  
  // Sort products by archetype match score
  Object.keys(groupedProducts).forEach(type => {
    groupedProducts[type] = sortProductsByArchetypeMatch(groupedProducts[type], archetypeId);
  });
  
  // Create combinations
  const combinations: BoltProduct[][] = [];
  
  // Get top products for essential types
  const topEssentials = essentialTypes.map(type => groupedProducts[type][0]);
  
  // Create basic outfit with just essentials
  combinations.push(topEssentials);
  
  // Add optional products to create more combinations
  optionalTypes.forEach(type => {
    if (groupedProducts[type] && groupedProducts[type].length > 0) {
      const optionalProduct = groupedProducts[type][0];
      combinations.push([...topEssentials, optionalProduct]);
    }
  });
  
  return combinations;
}

export default {
  groupProductsByType,
  groupProductsByArchetype,
  groupProductsBySeason,
  filterProductsByStyleTags,
  sortProductsByArchetypeMatch,
  getTopProductsByType,
  createOutfitCombinations
};