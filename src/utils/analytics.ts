import { getCookiePrefs, CONSENT_KEY } from "@/utils/consent";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function updateConsentState(granted: boolean) {
  if (typeof window.gtag !== "function") return;
  window.gtag("consent", "update", {
    analytics_storage: granted ? "granted" : "denied",
    ad_storage: "denied",
  });
}

function canTrack(): boolean {
  try {
    return getCookiePrefs().analytics && typeof window !== "undefined";
  } catch {
    return false;
  }
}

export function initAnalytics() {
  updateConsentState(canTrack());

  try {
    window.addEventListener("storage", (e) => {
      if (e.key !== CONSENT_KEY) return;
      updateConsentState(canTrack());
    });
  } catch {}
}

export function track(event: string, payload: Record<string, unknown> = {}) {
  try {
    if (!canTrack() || typeof window.gtag !== "function") return;
    window.gtag("event", event, payload);
  } catch {}
}

export function pageview(path: string) {
  try {
    if (!canTrack() || typeof window.gtag !== "function") return;
    window.gtag("event", "page_view", { page_path: path });
  } catch {}
}
