/**
 * Analytics utilities for FitFi
 * Provides safe, fail-safe analytics tracking
 */

export type AnalyticsPayload = Record<string, any>;

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    plausible?: (event: string, opts?: { props?: Record<string, any> }) => void;
  }
}

/**
 * Track an event with fallback to multiple providers
 */
export function track(event: string, props: AnalyticsPayload = {}) {
  try {
    // Google Analytics 4 (gtag)
    if (typeof window?.gtag === 'function') {
      window.gtag('event', event, props);
    }
    // Plausible Analytics
    else if (typeof window?.plausible === 'function') {
      window.plausible(event, { props });
    }
    // Development logging
    else if (import.meta.env.DEV) {
      console.info('[Analytics]', event, props);
    }
  } catch (error) {
    // Fail silently in production, log in development
    if (import.meta.env.DEV) {
      console.warn('[Analytics] Tracking failed:', error);
    }
  }
}

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