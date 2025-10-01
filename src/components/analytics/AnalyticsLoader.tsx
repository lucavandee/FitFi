import React from "react";
import { useLocation } from "react-router-dom";
import { getCookiePrefs } from "@/utils/consent";

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

function ensureGtag(id: string) {
  if (window.gtag) return;
  const s1 = document.createElement("script");
  s1.async = true;
  s1.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  document.head.appendChild(s1);

  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) {
    (window.dataLayer as any[]).push(args);
  }
  window.gtag = gtag as any;
  gtag("js", new Date());
  gtag("config", id);
}

export default function AnalyticsLoader() {
  const loc = useLocation();
  const id = (import.meta.env.VITE_GTAG_ID as string | undefined) || "";

  const [enabled, setEnabled] = React.useState<boolean>(() => {
    try {
      const prefs = getCookiePrefs();
      return !!id && !!prefs.analytics;
    } catch {
      return false;
    }
  });

  // Reageer op consent-wijzigingen & init
  React.useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key && e.key !== "ff_cookie_prefs") return;
      try {
        const prefs = getCookiePrefs();
        const ok = !!id && !!prefs.analytics;
        setEnabled(ok);
        if (ok) ensureGtag(id);
      } catch {}
    };
    window.addEventListener("storage", onStorage);
    onStorage(new StorageEvent("storage", { key: "ff_cookie_prefs" }));
    return () => window.removeEventListener("storage", onStorage);
  }, [id]);

  // Pageviews voor SPA
  React.useEffect(() => {
    if (!enabled || !window.gtag) return;
    window.gtag("event", "page_view", { page_path: loc.pathname + loc.search });
  }, [enabled, loc.pathname, loc.search]);

  return null;
}