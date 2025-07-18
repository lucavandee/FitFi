/**
 * Sentry configuration without replayIntegration
 */
import * as Sentry from '@sentry/react';

/**
 * Initialize Sentry with proper configuration
 * This avoids the replayIntegration warning
 */
export function initializeSentry() {
  const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
  
  if (!sentryDsn || sentryDsn === '' || sentryDsn === 'your_sentry_dsn_here') {
    console.warn('Sentry DSN not found in environment variables. Sentry will not be initialized.');
    return;
  }

  try {
    Sentry.init({
      dsn: sentryDsn,
      integrations: [
        new Sentry.BrowserTracing({
          // Set sampling rate for performance monitoring
          tracePropagationTargets: ['localhost', /^https:\/\/fitfi\.app/],
        }),
        // Explicitly NOT using replayIntegration to avoid warnings
      ],
      // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring
      // We recommend adjusting this value in production
      tracesSampleRate: 1.0,
      // Only enable Sentry in production
      enabled: import.meta.env.PROD,
      // Set environment
      environment: import.meta.env.VITE_ENVIRONMENT || 'development',
      // Set release version
      release: import.meta.env.VITE_APP_VERSION || '1.0.0',
    });
    
    console.log('Sentry initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Sentry:', error);
  }
}

export default {
  initializeSentry
};