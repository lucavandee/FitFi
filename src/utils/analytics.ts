/**
 * Analytics utilities for FitFi
 * Provides safe, fail-safe analytics tracking
 */

/**
 * Track a pageview
 */
export function pageview(url: string, params: Record<string, any> = {}) {
  try {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('config', import.meta.env.VITE_GTAG_ID || 'GA_MEASUREMENT_ID', {
        page_path: url,
        ...params
      });
    }
  } catch (error) {
    console.debug('[Analytics] Pageview failed:', error);
  }
}

/**
 * Track an event
 */
export function event(name: string, params: Record<string, any> = {}) {
  try {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', name, params);
    }
  } catch (error) {
    console.debug('[Analytics] Event failed:', error);
  }
}

/**
 * Track an exception
 */
export function exception(description: string, fatal: boolean = false) {
  try {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'exception', {
        description,
        fatal
      });
    }
  } catch (error) {
    console.debug('[Analytics] Exception failed:', error);
  }
}

/**
 * Generic track function (alias for event)
 */
export function track(name: string, params: Record<string, any> = {}) {
  return event(name, params);
}

/**
 * Track event with category and label (legacy format)
 */
export function trackEvent(
  action: string,
  category: string = 'general',
  label?: string,
  value?: number,
  params: Record<string, any> = {}
) {
  return event(action, {
    event_category: category,
    event_label: label,
    value,
    ...params
  });
}

// Default export
const analytics = { pageview, event, exception, track, trackEvent };
export default analytics;