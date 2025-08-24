/**
 * React Router v7 future flags configuration
 *
 * This utility helps configure React Router to use future flags
 * and suppress future version warnings.
 */

// No longer importing UNSAFE_enhanceManualRouteObjects as it's removed in react-router-dom v6.22.3

/**
 * Configures React Router future flags
 * Call this function in your main.tsx before rendering the app
 */
export function configureRouterFutureFlags() {
  // Set future flags to suppress warnings
  // This is a temporary solution until we upgrade to React Router v7
  if (typeof window !== "undefined") {
    (window as any).REACT_ROUTER_FUTURE = {
      v7_relativeSplatPath: true,
      v7_normalizeFormMethod: true,
      v7_prependBasename: true,
    };
  }
}
