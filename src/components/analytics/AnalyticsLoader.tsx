import React from "react";
import { getCookiePrefs, CONSENT_KEY } from "@/utils/consent";
import { setTelemetrySink } from "@/utils/telemetry";

/**
 * Kiest waar telemetry.track() heen gaat. gtag.js laden doet dit onderdeel niet
 * meer: dat gebeurt op een plek, src/utils/analytics.ts, en pas na toestemming.
 * Hier stond een tweede lader die per route een eigen page_view stuurde; naast
 * de page_view uit config en de routes die GA4 zelf telt, was dat dubbel.
 *
 * Bestaand gedrag, bewust niet veranderd: zonder VITE_GTAG_ID zet dit de sink
 * op null, ook na toestemming, en dan gaan telemetry-events nergens heen. In de
 * productiebundel van 8 oktober 2026 was VITE_GTAG_ID leeg. Of die events naar
 * GA moeten, is een aparte keuze.
 */
const GA_ID = (import.meta.env.VITE_GTAG_ID as string | undefined) || "";

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
  const [enabled, setEnabled] = React.useState<boolean>(isAnalyticsEnabled);

  React.useEffect(() => {
    setTelemetrySink(enabled ? ga4Sink : null);
  }, [enabled]);

  React.useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key && e.key !== CONSENT_KEY) return;
      setEnabled(isAnalyticsEnabled());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return null;
}
