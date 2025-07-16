/**
 * Utility functions for product normalization and validation
 */

/**
 * Normalizes product data to ensure all array fields are actually arrays
 * This prevents "x.map is not a function" errors when fields are sometimes strings
 * 
 * @param product - The product to normalize
 * @returns A normalized product with consistent data types
 */
export function normalizeProduct(product: any) {
  if (!product) return {};
  
  return {
    ...product,
    // Normalize common array fields that might sometimes be strings
    season: Array.isArray(product.season) ? product.season : (product.season ? [product.season] : []),
    style: Array.isArray(product.style) ? product.style : (product.style ? [product.style] : []),
    tags: Array.isArray(product.tags) ? product.tags : (product.tags ? [product.tags] : []),
    colors: Array.isArray(product.colors) ? product.colors : (product.colors ? [product.colors] : []),
    sizes: Array.isArray(product.sizes) ? product.sizes : (product.sizes ? [product.sizes] : []),
    styleTags: Array.isArray(product.styleTags) ? product.styleTags : (product.styleTags ? [product.styleTags] : []),
  };
}

/**
 * Safely gets a product's season as a string
 * 
 * @param product - The product to get the season from
 * @param formatter - Optional function to format each season string
 * @returns A comma-separated string of seasons
 */
export function getProductSeasonText(product: any, formatter?: (season: string) => string): string {
  if (!product) return '';
  
  const normalizedProduct = normalizeProduct(product);
  
  if (!normalizedProduct.season || normalizedProduct.season.length === 0) {
    return 'Alle seizoenen';
  }
  
  if (formatter) {
    return normalizedProduct.season.map(formatter).join(', ');
  }
  
  return normalizedProduct.season.join(', ');
}

export default {
  normalizeProduct,
  getProductSeasonText
};