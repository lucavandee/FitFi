/**
 * Sentry configuration stub (Sentry removed for optimization)
 */

/**
 * Initialize Sentry - No-op implementation since Sentry was removed
 */
export function initializeSentry() {
  // Sentry removed for bundle size optimization
  if (import.meta.env.DEV) {
    console.log('Sentry disabled for optimization');
  }
}

export default {
  initializeSentry
};