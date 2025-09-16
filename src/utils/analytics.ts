// src/utils/analytics.ts
// Stabiele, provider-agnostische analytics + harde garantie op named export `w`.

type Props = Record<string, unknown>;

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;                       // GA4
    plausible?: (event: string, opts?: { props?: Props }) => void; // Plausible
    umami?: { track: (event: string, props?: Props) => void; trackView?: (url?: string, ref?: string) => void };
    fathom?: { trackEvent?: (event: string, value?: number, opts?: any) => void };
    FITFI_ANALYTICS_READY?: boolean;
  }
}

/** Kleine cache-buster zodat Vite/HMR nooit een oude module laat hangen. */
export const __ANALYTICS_VERSION__ = "v4-2025-09-16";

const safe = (fn: unknown, ...args: any[]) => {
  try { if (typeof fn === "function") (fn as any)(...args); } catch { /* analytics mag nooit de app breken */ }
};

export function initAnalytics(): void {
  window.FITFI_ANALYTICS_READY = true;
}

export function track(event: string, props: Props = {}): void {
  // GA4
  safe(window.gtag, "event", event, props);
  // Plausible
  safe(window.plausible, event, { props });
  // Umami
  if (window.umami?.track) safe(window.umami.track, event, props);
  // Fathom
  if (window.fathom?.trackEvent) safe(window.fathom.trackEvent, event);
}

export function pageview(path?: string): void {
  const url = path ?? (typeof location !== "undefined" ? location.pathname + location.search : "/");
  safe(window.gtag, "event", "page_view", {
    page_location: typeof location !== "undefined" ? location.href : undefined,
    page_path: url,
  });
  safe(window.plausible, "pageview", { props: { url } });
  if (window.umami?.trackView) safe(window.umami.trackView, url, typeof document !== "undefined" ? document.referrer : "");
}

export function identify(userId: string, traits: Props = {}): void {
  safe(window.gtag, "set", "user_properties", { user_id: userId, ...traits });
}

/** Belangrijk: named alias zodat `import { w } ...` altijd werkt. */
export { track as w };

/** Default-bundle voor ergonomie. */
const analytics = { initAnalytics, track, pageview, identify, w: track };
export default analytics;