// Analytics utilities for FitFi
// Provides safe wrappers around gtag for tracking events

declare global {
  interface Window {
    gtag?: (command: string, targetId: string, config?: any) => void;
  }
}

/**
 * Track a page view
 */
export function pageview(url: string) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('config', 'GA_MEASUREMENT_ID', {
      page_path: url,
    });
  } else {
    console.debug('[analytics/pageview]', url);
  }
}

/**
 * Track a custom event
 */
export function event(name: string, params: Record<string, any> = {}) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', name, params);
  } else {
    console.debug('[analytics/event]', name, params);
  }
}

/**
 * Track an exception
 */
export function exception(description: string, fatal = false) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', 'exception', {
      description,
      fatal,
    });
  } else {
    console.debug('[analytics/exception]', description, fatal);
  }
}

/**
 * Alias for event function
 */
export const track = event;

/**
 * Another alias for event function (for AdvancedAnalytics compatibility)
 */
export function trackEvent(name: string, params: Record<string, any> = {}) {
  return event(name, params);
}

// Default export
const analytics = { pageview, event, exception, track, trackEvent };
export default analytics;