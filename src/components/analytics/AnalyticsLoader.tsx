import React from "react";
import { useLocation } from "react-router-dom";
import { getCookiePrefs } from "@/components/legal/CookieBanner";

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

function loadGtag(id: string) {
  if (window.gtag) return; // already loaded
  const s1 = document.createElement("script");
  s1.async = true;
  s1.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  document.head.appendChild(s1);

  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) { (window.dataLayer as any[]).push(args); }
  window.gtag = gtag as any;
  gtag("js", new Date());
  gtag("config", id);
}

export default function AnalyticsLoader() {
  const loc = useLocation();
  const id = import.meta.env.VITE_GTAG_ID as string | undefined;
  const [enabled, setEnabled] = React.useState<boolean>(() => {
    try { return !!(id && getCookiePrefs().analytics); } catch { return false; }
  });

  React.useEffect(() => {
    const onStorage = () => {
      try {
        const prefs = getCookiePrefs();
        const ok = !!(id && prefs.analytics);
        setEnabled(ok);
        if (ok) loadGtag(id!);
      } catch {}
    };
    window.addEventListener("storage", onStorage);
    onStorage(); // first run
    return () => window.removeEventListener("storage", onStorage);
  }, [id]);

  // SPA pageviews
  React.useEffect(() => {
    if (!enabled || !window.gtag) return;
    window.gtag("event", "page_view", { page_path: loc.pathname + loc.search });
  }, [enabled, loc.pathname, loc.search]);

  return null;
}