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
 * Event helper (gebruik: w("event_naam", { key: "value" }))
 */
export function w(event: string, payload: AnalyticsPayload = {}): void {
  try {
    if (typeof window === "undefined") return;

    // 1) GA4
    if (typeof window.gtag === "function") {
      window.gtag("event", event, payload);
      return;
    }

    // 2) GTM
    if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({ event, ...payload });
      return;
    }

    // 3) Segment
    if (window.analytics?.track) {
      window.analytics.track(event, payload);
      return;
    }
  } catch {
    // ignore
  }

  // 4) Dev fallback
  // eslint-disable-next-line no-console
  console.debug("[analytics:w]", event, payload);
}

/** Track a pageview */
export function pageview(path?: string, title?: string): void {
  if (typeof window === "undefined") return;

  const params: Record<string, any> = {};
  if (path) params.page_location = path;
  if (title) params.page_title = title;

  if (typeof window.gtag === "function") {
    window.gtag("event", "page_view", params);
  } else if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({ event: "page_view", ...params });
  } else if (window.analytics?.track) {
    window.analytics.track("page_view", params);
  } else {
    // eslint-disable-next-line no-console
    console.debug("[analytics:pageview]", params);
  }
}