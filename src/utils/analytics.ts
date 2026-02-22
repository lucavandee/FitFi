import { getCookiePrefs, CONSENT_KEY } from "@/utils/consent";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const GA_ID = import.meta.env.VITE_GTAG_ID as string | undefined;

let initialized = false;

function loadGA() {
  if (initialized || !GA_ID) return;
  initialized = true;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function (...args: unknown[]) {
    (window.dataLayer as unknown[]).push(args);
  };
  window.gtag("js", new Date());
  window.gtag("config", GA_ID, { anonymize_ip: true });
}

function canTrack(): boolean {
  try {
    return !!GA_ID && getCookiePrefs().analytics && typeof window !== "undefined";
  } catch {
    return false;
  }
}

export function initAnalytics() {
  if (canTrack()) {
    loadGA();
  }

  try {
    window.addEventListener("storage", (e) => {
      if (e.key !== CONSENT_KEY) return;
      if (canTrack()) loadGA();
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
