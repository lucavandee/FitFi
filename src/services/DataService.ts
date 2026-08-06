// Herexporteer consistente API uit de lowercase module
export * from './data/dataService';
import {
  fetchProducts, fetchOutfits, fetchUser,
} from './data/dataService';

// Let op: clearCache/getCacheStats/getRecentErrors/healthCheck bestaan niet
// (meer) in ./data/dataService en zijn hier bewust verwijderd i.p.v. gefaked.
export const dataService = {
  fetchProducts, fetchOutfits, fetchUser,
};

export default dataService;