// Re-export from new data service orchestrator
export { 
  fetchProducts as getProducts,
  fetchOutfits as getOutfits, 
  fetchUser as getUser,
  clearCache,
  getCacheStats,
  getRecentErrors,
  healthCheck,
  dataService
} from './data/dataService';

// Legacy compatibility
export const dataService = {
  getProducts: fetchProducts,
  getOutfits: fetchOutfits,
  getUser: fetchUser,
  clearCache,
  getCacheStats,
  getRecentErrors
};