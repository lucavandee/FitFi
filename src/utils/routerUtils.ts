/**
 * React Router v7 future flags configuration
 * 
 * This utility helps configure React Router to use future flags
 * and suppress future version warnings.
 */

import { UNSAFE_enhanceManualRouteObjects } from 'react-router-dom';

/**
 * Configures React Router future flags
 * Call this function in your main.tsx before rendering the app
 */
export function configureRouterFutureFlags() {
  // Set future flags to suppress warnings
  // This is a temporary solution until we upgrade to React Router v7
  if (typeof window !== 'undefined') {
    window.REACT_ROUTER_FUTURE = {
      v7_relativeSplatPath: true,
      v7_normalizeFormMethod: true,
      v7_prependBasename: true
    };
  }
}

/**
 * Enhances route objects with future flags
 * Use this when defining your routes
 */
export const enhanceRoutes = UNSAFE_enhanceManualRouteObjects;

export default {
  configureRouterFutureFlags,
  enhanceRoutes
};