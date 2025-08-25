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
    analytics?: { track?: (ev: string, payload?: Record<string, any>) => void };
  }
}

/** Event helper, gebruik: w("event_naam", { ... }) */
export function w(event: string, payload: AnalyticsPayload = {}): void {
  try {
    if (typeof window === "undefined") return;
    if (typeof window.gtag === "function") {
      window.gtag("event", event, payload);
      return;
    }
    if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({ event, ...payload });
      return;
    }
    if (window.analytics?.track) {
      window.analytics.track(event, payload);
      return;
    }
  } catch {}
  console.debug?.("[analytics:w]", event, payload);
}

/** Track a pageview (enkelvoudige export om dubbelexport te voorkomen) */
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
    console.debug?.("[analytics:pageview]", params);
  }
}

export default undefined;