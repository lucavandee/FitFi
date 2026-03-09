import React from "react";
import { useLocation } from "react-router-dom";
import { getCookiePrefs, CONSENT_KEY } from "@/utils/consent";
import { setTelemetrySink } from "@/utils/telemetry";

declare global {
  interface Window { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void; }
}

const GA_ID = (import.meta.env.VITE_GTAG_ID as string | undefined) || "";

function ensureGtag() {
  if (!GA_ID || window.gtag) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function (...args: unknown[]) { (window.dataLayer as unknown[]).push(args); };
  window.gtag("js", new Date());
  window.gtag("config", GA_ID, { anonymize_ip: true });

  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);
}

function ga4Sink(event: string, props?: Record<string, unknown>) {
  try {
    if (typeof window.gtag !== "function") return;
    window.gtag("event", event, props ?? {});
  } catch {}
}

function isAnalyticsEnabled(): boolean {
  try { return !!GA_ID && !!getCookiePrefs().analytics; } catch { return false; }
}

export default function AnalyticsLoader() {
  const loc = useLocation();
  const [enabled, setEnabled] = React.useState<boolean>(isAnalyticsEnabled);

  React.useEffect(() => {
    if (enabled) {
      ensureGtag();
      setTelemetrySink(ga4Sink);
    } else {
      setTelemetrySink(null);
    }
  }, [enabled]);

  React.useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key && e.key !== CONSENT_KEY) return;
      setEnabled(isAnalyticsEnabled());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  React.useEffect(() => {
    if (!enabled || typeof window.gtag !== "function") return;
    window.gtag("event", "page_view", { page_path: loc.pathname + loc.search });
  }, [enabled, loc.pathname, loc.search]);

  return null;
}
