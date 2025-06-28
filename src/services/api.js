import { getApiConfig, shouldUseMockData, getApiUrl, getApiHeaders } from '../config/api-config';
import { dutchProductDatabase, getProductsByCategory } from '../data/dutchProducts';
import { outfitCombinations, getOutfitsByStyle } from '../data/outfitCombinations';
import { crossSellProductDatabase, getCrossSellByProfile } from '../data/crossSellProducts';

// Simple in-memory cache
const cache = new Map();

/**
 * Fetch data from API with caching
 * @param {string} url - API URL
 * @param {Object} options - Fetch options
 * @returns {Promise<any>} Response data
 */
const fetchWithCache = async (url, options = {}) => {
  const config = getApiConfig();
  const cacheKey = `${url}-${JSON.stringify(options)}`;
  
  // Check cache if enabled
  if (config.cache.enabled && cache.has(cacheKey)) {
    const { data, timestamp } = cache.get(cacheKey);
    const now = Date.now();
    
    // Return cached data if not expired
    if (now - timestamp < config.cache.ttl * 1000) {
      console.log(`[API] Using cached data for: ${url}`);
      return data;
    }
    
    // Remove expired cache entry
    cache.delete(cacheKey);
  }
  
  // Set default options
  const fetchOptions = {
    ...options,
    headers: {
      ...getApiHeaders(),
      ...options.headers
    },
    timeout: config.request.timeout
  };
  
  try {
    // Fetch data from API
    const response = await fetch(url, fetchOptions);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Cache response if enabled
    if (config.cache.enabled) {
      // Limit cache size
      if (cache.size >= config.cache.maxSize) {
        // Remove oldest entry
        const oldestKey = cache.keys().next().value;
        cache.delete(oldestKey);
      }
      
      cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
    }
    
    return data;
  } catch (error) {
    console.error(`[API] Error fetching ${url}:`, error);
    throw error;
  }
};

/**
 * Get products by category
 * @param {string} category - Product category
 * @returns {Promise<Array>} Products
 */
export const getProducts = async (category) => {
  if (shouldUseMockData()) {
    console.log(`[API] Using mock data for products in category: ${category}`);
    return getProductsByCategory(category);
  }
  
  const url = getApiUrl(getApiConfig().endpoints.products, { category });
  return fetchWithCache(url);
};

/**
 * Get outfit recommendations by style
 * @param {string} style - Style preference
 * @returns {Promise<Array>} Outfit recommendations
 */
export const getOutfitRecommendations = async (style) => {
  if (shouldUseMockData()) {
    console.log(`[API] Using mock data for outfit recommendations with style: ${style}`);
    return getOutfitsByStyle(style);
  }
  
  const url = getApiUrl(getApiConfig().endpoints.outfits, { style });
  return fetchWithCache(url);
};

/**
 * Get cross-sell products by profile
 * @param {string} profileType - User profile type
 * @returns {Promise<Array>} Cross-sell products
 */
export const getCrossSellProducts = async (profileType) => {
  if (shouldUseMockData()) {
    console.log(`[API] Using mock data for cross-sell products with profile: ${profileType}`);
    return getCrossSellByProfile(profileType);
  }
  
  const url = getApiUrl(getApiConfig().endpoints.products, { 
    profile: profileType,
    type: 'cross_sell'
  });
  return fetchWithCache(url);
};

/**
 * Get product details by ID
 * @param {string} productId - Product ID
 * @param {string} retailer - Retailer name
 * @returns {Promise<Object>} Product details
 */
export const getProductDetails = async (productId, retailer) => {
  if (shouldUseMockData()) {
    console.log(`[API] Using mock data for product details: ${productId}`);
    const allProducts = dutchProductDatabase;
    return allProducts.find(p => p.id === productId) || null;
  }
  
  const url = getApiUrl(`${getApiConfig().endpoints.products}/${productId}`, { retailer });
  return fetchWithCache(url);
};

/**
 * Get user style profile
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User style profile
 */
export const getUserStyleProfile = async (userId) => {
  if (shouldUseMockData()) {
    console.log(`[API] Using mock data for user style profile: ${userId}`);
    return {
      id: userId,
      styleType: 'casual_chic',
      preferences: {
        casual: 4,
        formal: 3,
        sporty: 2,
        vintage: 5,
        minimalist: 4
      },
      favoriteColors: ['navy', 'beige', 'white'],
      occasions: ['work', 'casual', 'weekend']
    };
  }
  
  const url = getApiUrl(`${getApiConfig().endpoints.user}/${userId}/style`);
  return fetchWithCache(url);
};

/**
 * Search products
 * @param {string} query - Search query
 * @param {Object} filters - Search filters
 * @returns {Promise<Array>} Search results
 */
export const searchProducts = async (query, filters = {}) => {
  if (shouldUseMockData()) {
    console.log(`[API] Using mock data for product search: ${query}`);
    const allProducts = dutchProductDatabase;
    return allProducts.filter(p => 
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.brand.toLowerCase().includes(query.toLowerCase()) ||
      p.category.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 10);
  }
  
  const url = getApiUrl(getApiConfig().endpoints.products, { 
    q: query,
    ...filters
  });
  return fetchWithCache(url);
};

export default {
  getProducts,
  getOutfitRecommendations,
  getCrossSellProducts,
  getProductDetails,
  getUserStyleProfile,
  searchProducts
};