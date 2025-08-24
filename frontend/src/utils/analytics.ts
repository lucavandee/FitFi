/**
 * FitFi Analytics helper
 * Named export `w` is de event-dispatcher die in de app gebruikt wordt.
 * Stuur events naar GA4 (gtag), GTM (dataLayer) of Segment (window.analytics),
 * en val veilig terug op console.debug in dev.
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

// Optioneel: simpele helper voor pageviews (niet verplicht, maar handig)
export function pageview(path?: string, title?: string): void {
  if (typeof window === 'undefined') return;
  const params: Record<string, any> = {};
  if (path) params.page_location = path;
  if (title) params.page_title = title;
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

export default undefined; // expliciet géén default export
