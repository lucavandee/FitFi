/**
 * FitFi Analytics helper
 * - Named export `w`: event dispatcher (GA4/GTM/Segment) met veilige fallback.
 * - Named export `pageview`: één definitie die beide handtekeningen ondersteunt:
 *     pageview(path?: string, title?: string)
 *     pageview(params?: Record<string, any>)
 */

export type AnalyticsPayload = {
  event_category?: string;
  event_label?: string;
  value?: number | string;
  [key: string]: unknown;
};

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
    analytics?: { track?: (event: string, payload?: Record<string, any>) => void };
  }
}

/**
 * Event helper (gebruik overal `w('event_naam', { ...payload })`)
 */
export function w(event: string, payload: AnalyticsPayload = {}): void {
  try {
    if (typeof window === 'undefined') return;

    // 1) GA4 (gtag)
    if (typeof window.gtag === 'function') {
      window.gtag('event', event, payload);
      return;
    }

    // 2) GTM (dataLayer)
    if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({ event, ...payload });
      return;
    }

    // 3) Segment (window.analytics)
    if (window.analytics && typeof window.analytics.track === 'function') {
      window.analytics.track(event, payload);
      return;
    }
  } catch {
    // negeer
  }

  // 4) Fallback voor dev
  if (typeof console !== 'undefined') {
    // eslint-disable-next-line no-console
    console.debug('[analytics:w]', event, payload);
  }
}

type PageviewArg = string | Record<string, any> | undefined;

/**
 * Track a pageview.
 * Ondersteunt zowel (path?: string, title?: string) als (params?: Record<string, any>)
 */
export function pageview(a?: PageviewArg, b?: PageviewArg): void {
  if (typeof window === 'undefined') return;

  let params: Record<string, any> = {};

  // variant 1: (path?: string, title?: string)
  if (typeof a === 'string' && (typeof b === 'undefined' || typeof b === 'string')) {
    if (a) params.page_location = a;
    if (typeof b === 'string' && b) params.page_title = b;
  } else if (a && typeof a === 'object') {
    // variant 2: (params?: Record<string, any>)
    params = { ...a };
  }

  if (typeof window.gtag === 'function') {
    window.gtag('event', 'page_view', params);
  } else if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({ event: 'page_view', ...params });
  } else if (window.analytics?.track) {
    window.analytics.track('page_view', params);
  } else {
    // eslint-disable-next-line no-console
    console.debug('[analytics:pageview]', params);
  }
}

/**
 * Alias for `w` function - for backward compatibility
 */
export const track = w;

// Let op: GEEN default export