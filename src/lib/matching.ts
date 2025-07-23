/**
 * Gender-based product matching functionality
 * Ensures users only see products appropriate for their gender preference
 */

import { Product } from '../engine/types';
import { UserProfile } from '../context/UserContext';

// Define supported gender types
export type SupportedGender = 'male' | 'female' | 'neutral';

// Define product gender tags
export type ProductGenderTag = 'men' | 'women' | 'unisex';

// Interface for gender mapping configuration
export interface GenderMappingConfig {
  strictMode: boolean; // If true, throw errors for invalid data
  fallbackToUnisex: boolean; // If true, fallback to unisex products when no gender-specific products found
  logWarnings: boolean; // If true, log warnings for debugging
}

// Default configuration
const DEFAULT_CONFIG: GenderMappingConfig = {
  strictMode: true,
  fallbackToUnisex: true,
  logWarnings: true
};

/**
 * Validates if a gender value is supported
 * @param gender - Gender value to validate
 * @returns Whether the gender is supported
 */
export function isValidGender(gender: any): gender is SupportedGender {
  return typeof gender === 'string' && ['male', 'female', 'neutral'].includes(gender);
}

/**
 * Validates if a product has valid gender tags
 * @param product - Product to validate
 * @returns Whether the product has valid gender tags
 */
export function hasValidGenderTags(product: Product): boolean {
  if (!product.styleTags || !Array.isArray(product.styleTags)) {
    return false;
  }
  
  const validTags: ProductGenderTag[] = ['men', 'women', 'unisex'];
  return product.styleTags.some(tag => validTags.includes(tag as ProductGenderTag));
}

/**
 * Gets the appropriate gender tag for filtering based on user gender
 * @param userGender - User's gender preference
 * @returns The corresponding product gender tag
 */
export function getGenderTagForUser(userGender: SupportedGender): ProductGenderTag {
  const genderMapping: Record<SupportedGender, ProductGenderTag> = {
    'male': 'men',
    'female': 'women',
    'neutral': 'unisex'
  };
  
  return genderMapping[userGender];
}

/**
 * Filters products based on user gender preference
 * @param products - Array of products to filter
 * @param userGender - User's gender preference
 * @param config - Optional configuration for filtering behavior
 * @returns Filtered array of products
 * @throws Error if strict mode is enabled and invalid data is encountered
 */
export function filterProductsByGender(
  products: Product[],
  userGender: string | undefined,
  config: Partial<GenderMappingConfig> = {}
): Product[] {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  // Validate inputs
  if (!Array.isArray(products)) {
    if (finalConfig.strictMode) {
      throw new Error('Products must be an array');
    }
    if (finalConfig.logWarnings) {
      console.warn('[Gender Matching] Invalid products array provided');
    }
    return [];
  }
  
  if (products.length === 0) {
    if (finalConfig.logWarnings) {
      console.warn('[Gender Matching] Empty products array provided');
    }
    return [];
  }
  
  // Validate and normalize user gender
  if (!userGender || !isValidGender(userGender)) {
    if (finalConfig.strictMode) {
      throw new Error(`Invalid user gender: ${userGender}. Must be 'male', 'female', or 'neutral'`);
    }
    if (finalConfig.logWarnings) {
      console.warn(`[Gender Matching] Invalid user gender: ${userGender}, defaulting to 'neutral'`);
    }
    userGender = 'neutral';
  }
  
  const validatedGender = userGender as SupportedGender;
  const targetGenderTag = getGenderTagForUser(validatedGender);
  
  if (finalConfig.logWarnings) {
    console.log(`[Gender Matching] Filtering ${products.length} products for gender: ${validatedGender} (looking for tag: ${targetGenderTag})`);
  }
  
  // Filter products by gender tag
  const genderFilteredProducts = products.filter(product => {
    // Validate product structure
    if (!product || typeof product !== 'object') {
      if (finalConfig.logWarnings) {
        console.warn('[Gender Matching] Invalid product object encountered');
      }
      return false;
    }
    
    // Check if product has style tags
    if (!product.styleTags || !Array.isArray(product.styleTags)) {
      if (finalConfig.logWarnings) {
        console.warn(`[Gender Matching] Product ${product.id || 'unknown'} has no valid styleTags`);
      }
      return false;
    }
    
    // Check if product has the target gender tag
    return product.styleTags.includes(targetGenderTag);
  });
  
  if (finalConfig.logWarnings) {
    console.log(`[Gender Matching] Found ${genderFilteredProducts.length} products matching gender tag: ${targetGenderTag}`);
  }
  
  // If no products found and fallback is enabled, try unisex products
  if (genderFilteredProducts.length === 0 && finalConfig.fallbackToUnisex && targetGenderTag !== 'unisex') {
    if (finalConfig.logWarnings) {
      console.warn(`[Gender Matching] No products found for ${targetGenderTag}, falling back to unisex products`);
    }
    
    const unisexProducts = products.filter(product => {
      return product.styleTags && Array.isArray(product.styleTags) && product.styleTags.includes('unisex');
    });
    
    if (finalConfig.logWarnings) {
      console.log(`[Gender Matching] Found ${unisexProducts.length} unisex fallback products`);
    }
    
    if (unisexProducts.length > 0) {
      return unisexProducts;
    }
  }
  
  // Final fallback: if still no products and fallback is enabled, return all products
  if (genderFilteredProducts.length === 0 && finalConfig.fallbackToUnisex) {
    if (finalConfig.logWarnings) {
      console.warn('[Gender Matching] No gender-specific or unisex products found, returning all products as final fallback');
    }
    return products;
  }
  
  // If strict mode and no products found, throw error
  if (genderFilteredProducts.length === 0 && finalConfig.strictMode) {
    throw new Error(`No products found for gender: ${validatedGender} (tag: ${targetGenderTag})`);
  }
  
  return genderFilteredProducts;
}

/**
 * Enhanced product filtering that combines gender filtering with other criteria
 * @param products - Array of products to filter
 * @param user - User profile containing gender and other preferences
 * @param additionalFilters - Optional additional filtering criteria
 * @param config - Optional configuration for filtering behavior
 * @returns Filtered array of products
 */
export function filterProductsForUser(
  products: Product[],
  user: UserProfile,
  additionalFilters?: {
    categories?: string[];
    priceRange?: { min: number; max: number };
    brands?: string[];
    seasons?: string[];
  },
  config: Partial<GenderMappingConfig> = {}
): Product[] {
  // First, filter by gender
  let filteredProducts = filterProductsByGender(products, user.gender, config);
  
  // Apply additional filters if provided
  if (additionalFilters) {
    // Filter by categories
    if (additionalFilters.categories && additionalFilters.categories.length > 0) {
      filteredProducts = filteredProducts.filter(product => 
        additionalFilters.categories!.includes(product.category || product.type || '')
      );
    }
    
    // Filter by price range
    if (additionalFilters.priceRange) {
      const { min, max } = additionalFilters.priceRange;
      filteredProducts = filteredProducts.filter(product => {
        const price = product.price || 0;
        return price >= min && price <= max;
      });
    }
    
    // Filter by brands
    if (additionalFilters.brands && additionalFilters.brands.length > 0) {
      filteredProducts = filteredProducts.filter(product => 
        additionalFilters.brands!.includes(product.brand || '')
      );
    }
    
    // Filter by seasons
    if (additionalFilters.seasons && additionalFilters.seasons.length > 0) {
      filteredProducts = filteredProducts.filter(product => {
        if (!product.season || !Array.isArray(product.season)) {
          return true; // Include products without season data
        }
        return product.season.some(season => additionalFilters.seasons!.includes(season));
      });
    }
  }
  
  return filteredProducts;
}

/**
 * Analyzes the gender distribution of products in a dataset
 * @param products - Array of products to analyze
 * @returns Analysis of gender distribution
 */
export function analyzeGenderDistribution(products: Product[]): {
  total: number;
  men: number;
  women: number;
  unisex: number;
  noGenderTags: number;
  distribution: Record<ProductGenderTag, number>;
} {
  const analysis = {
    total: products.length,
    men: 0,
    women: 0,
    unisex: 0,
    noGenderTags: 0,
    distribution: {
      men: 0,
      women: 0,
      unisex: 0
    } as Record<ProductGenderTag, number>
  };
  
  products.forEach(product => {
    if (!product.styleTags || !Array.isArray(product.styleTags)) {
      analysis.noGenderTags++;
      return;
    }
    
    const genderTags = product.styleTags.filter(tag => 
      ['men', 'women', 'unisex'].includes(tag)
    ) as ProductGenderTag[];
    
    if (genderTags.length === 0) {
      analysis.noGenderTags++;
      return;
    }
    
    // Count each gender tag (a product can have multiple)
    genderTags.forEach(tag => {
      analysis[tag]++;
      analysis.distribution[tag]++;
    });
  });
  
  return analysis;
}

/**
 * Validates that a product dataset has adequate gender representation
 * @param products - Array of products to validate
 * @param minPercentagePerGender - Minimum percentage each gender should represent (default: 20%)
 * @returns Validation result with recommendations
 */
export function validateGenderRepresentation(
  products: Product[],
  minPercentagePerGender: number = 20
): {
  isValid: boolean;
  analysis: ReturnType<typeof analyzeGenderDistribution>;
  recommendations: string[];
} {
  const analysis = analyzeGenderDistribution(products);
  const recommendations: string[] = [];
  
  if (analysis.total === 0) {
    return {
      isValid: false,
      analysis,
      recommendations: ['No products provided for validation']
    };
  }
  
  const minCount = Math.ceil((analysis.total * minPercentagePerGender) / 100);
  
  // Check each gender representation
  (['men', 'women', 'unisex'] as ProductGenderTag[]).forEach(gender => {
    const count = analysis.distribution[gender];
    const percentage = (count / analysis.total) * 100;
    
    if (percentage < minPercentagePerGender) {
      recommendations.push(
        `${gender} products: ${count} (${percentage.toFixed(1)}%) - needs at least ${minCount} products (${minPercentagePerGender}%)`
      );
    }
  });
  
  // Check for products without gender tags
  if (analysis.noGenderTags > 0) {
    const percentage = (analysis.noGenderTags / analysis.total) * 100;
    recommendations.push(
      `${analysis.noGenderTags} products (${percentage.toFixed(1)}%) have no gender tags - consider adding 'men', 'women', or 'unisex' tags`
    );
  }
  
  return {
    isValid: recommendations.length === 0,
    analysis,
    recommendations
  };
}

export default {
  filterProductsByGender,
  filterProductsForUser,
  analyzeGenderDistribution,
  validateGenderRepresentation,
  isValidGender,
  hasValidGenderTags,
  getGenderTagForUser
};