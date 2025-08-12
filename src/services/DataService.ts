// Herexporteer consistente API uit de lowercase module
export * from './data/dataService';
import {
  fetchProducts, fetchOutfits, fetchUser,
  clearCache, getCacheStats, getRecentErrors, healthCheck
} from './data/dataService';

export const dataService = {
  fetchProducts, fetchOutfits, fetchUser,
  clearCache, getCacheStats, getRecentErrors, healthCheck
};

export default dataService;