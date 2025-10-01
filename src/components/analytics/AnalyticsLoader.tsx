// /src/components/analytics/AnalyticsLoader.tsx
import React from "react";
import { useLocation } from "react-router-dom";
import { getCookiePrefs } from "@/utils/consent";

declare global {
  interface Window { dataLayer?: any[]; gtag?: (...args: any[]) => void; }
}

function ensureGtag(id: string) {
  if (window.gtag) return;
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  document.head.appendChild(s);

  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) { (window.dataLayer as any[]).push(args); }
  window.gtag = gtag as any;
  gtag("js", new Date());
  gtag("config", id);
}

export default function AnalyticsLoader() {
  const loc = useLocation();
  const id = (import.meta.env.VITE_GTAG_ID as string | undefined) || "";

  const [enabled, setEnabled] = React.useState<boolean>(() => {
    try { const p = getCookiePrefs(); return !!id && !!p.analytics; } catch { return false; }
  });

  React.useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key && e.key !== "ff_cookie_prefs") return;
      try {
        const p = getCookiePrefs();
        const ok = !!id && !!p.analytics;
        setEnabled(ok);
        if (ok) ensureGtag(id);
      } catch {}
    };
    window.addEventListener("storage", onStorage);
    onStorage(new StorageEvent("storage", { key: "ff_cookie_prefs" }));
    return () => window.removeEventListener("storage", onStorage);
  }, [id]);

  React.useEffect(() => {
    if (!enabled || !window.gtag) return;
    window.gtag("event", "page_view", { page_path: loc.pathname + loc.search });
  }, [enabled, loc.pathname, loc.search]);

  return null;
}