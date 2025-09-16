// Analytics — safe, multi-provider + legacy alias `w`
export type Props = Record<string, unknown>;

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    plausible?: (event: string, opts?: { props?: Props }) => void;
    umami?: { track: (event: string, props?: Props) => void; trackView?: (url?: string, ref?: string) => void };
    fathom?: { trackEvent?: (event: string, value?: number, opts?: any) => void };
  }
}

const safe = (fn: unknown, ...args: any[]) => {
  try {
    if (typeof fn === "function") (fn as any)(...args);
  } catch {
    /* no-op */
  }
};

export function initAnalytics(): void {
  // plaats voor init if needed (consent, etc.)
}

export function track(event: string, props: Props = {}): void {
  safe(window.gtag, "event", event, props);
  safe(window.plausible, event, { props });
  if (window.umami?.track) safe(window.umami.track, event, props);
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

/** 🔑 Legacy alias (breaks fix): sommige bestanden importeren `{ w }` of `{ w as track }` */
export const w = track;

const analytics = { initAnalytics, track, pageview, identify, w };
export default analytics;