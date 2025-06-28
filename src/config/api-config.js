/**
 * API Configuration for FitFi
 * 
 * This file contains configuration for API endpoints and toggles
 * for switching between mock data and live API data.
 */

const config = {
  // Toggle between mock data and live API
  useMockData: true,
  
  // API Base URLs
  apiBaseUrl: process.env.AFFILIATE_API_URL || 'https://api.fitfi.nl',
  
  // API Keys (these would normally be in .env)
  apiKey: process.env.AFFILIATE_API_KEY || 'mock-api-key',
  
  // Endpoints
  endpoints: {
    products: '/products',
    recommendations: '/recommendations',
    outfits: '/outfits',
    styles: '/styles',
    user: '/user'
  },
  
  // Retailer API configurations
  retailers: {
    zalando: {
      baseUrl: 'https://www.zalando.nl/api',
      productEndpoint: '/catalog/articles'
    },
    wehkamp: {
      baseUrl: 'https://www.wehkamp.nl/api/v2',
      productEndpoint: '/catalog/products'
    },
    hm: {
      baseUrl: 'https://www2.hm.com/nl_nl',
      productEndpoint: '/search-results.html'
    },
    asos: {
      baseUrl: 'https://www.asos.com/api/product/search/v2',
      productEndpoint: '/'
    },
    aboutyou: {
      baseUrl: 'https://api.aboutyou.de/v1',
      productEndpoint: '/products'
    },
    bijenkorf: {
      baseUrl: 'https://www.debijenkorf.nl/api',
      productEndpoint: '/search'
    },
    bolcom: {
      baseUrl: 'https://api.bol.com/catalog/v4',
      productEndpoint: '/search'
    }
  },
  
  // Cache settings
  cache: {
    enabled: true,
    ttl: 1800, // 30 minutes in seconds
    maxSize: 100 // Maximum number of cached items
  },
  
  // Request settings
  request: {
    timeout: 10000, // 10 seconds
    retries: 2,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  }
};

/**
 * Get API configuration
 * @returns {Object} The API configuration
 */
export const getApiConfig = () => {
  return config;
};

/**
 * Check if mock data should be used
 * @returns {boolean} True if mock data should be used
 */
export const shouldUseMockData = () => {
  return config.useMockData;
};

/**
 * Toggle between mock data and live API
 * @param {boolean} useMock - Whether to use mock data
 */
export const toggleMockData = (useMock) => {
  config.useMockData = useMock;
  console.log(`API Mode: ${useMock ? 'Mock Data' : 'Live API'}`);
  return config.useMockData;
};

/**
 * Get the full URL for an API endpoint
 * @param {string} endpoint - The endpoint path
 * @param {Object} params - Query parameters
 * @returns {string} The full URL
 */
export const getApiUrl = (endpoint, params = {}) => {
  const url = new URL(`${config.apiBaseUrl}${endpoint}`);
  
  // Add query parameters
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });
  
  return url.toString();
};

/**
 * Get headers for API requests
 * @param {boolean} includeAuth - Whether to include authorization header
 * @returns {Object} Headers object
 */
export const getApiHeaders = (includeAuth = true) => {
  const headers = { ...config.request.headers };
  
  if (includeAuth) {
    headers['Authorization'] = `Bearer ${config.apiKey}`;
  }
  
  return headers;
};

export default config;