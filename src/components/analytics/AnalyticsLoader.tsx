import React from "react";
import { useLocation } from "react-router-dom";
import { getCookiePrefs, CONSENT_KEY } from "@/utils/consent";

declare global {
  interface Window { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void; }
}

function ensureGtag(id: string) {
  if (window.gtag) return;
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  document.head.appendChild(s);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function (...args: unknown[]) { (window.dataLayer as unknown[]).push(args); };
  window.gtag("js", new Date());
  window.gtag("config", id, { anonymize_ip: true });
}

export default function AnalyticsLoader() {
  const loc = useLocation();
  const id = (import.meta.env.VITE_GTAG_ID as string | undefined) || "";

  const [enabled, setEnabled] = React.useState<boolean>(() => {
    try { return !!id && !!getCookiePrefs().analytics; } catch { return false; }
  });

  React.useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key && e.key !== CONSENT_KEY) return;
      try {
        const ok = !!id && !!getCookiePrefs().analytics;
        setEnabled(ok);
        if (ok) ensureGtag(id);
      } catch {}
    };
    window.addEventListener("storage", onStorage);
    if (enabled) ensureGtag(id);
    return () => window.removeEventListener("storage", onStorage);
  }, [id]);

  React.useEffect(() => {
    if (!enabled || typeof window.gtag !== "function") return;
    window.gtag("event", "page_view", { page_path: loc.pathname + loc.search });
  }, [enabled, loc.pathname, loc.search]);

  return null;
}