import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { pageview, w as track } from "@/utils/analytics";

/** Stuurt pageview-events en warmt lazy routes op na idle. */
const RouteChangeTracker: React.FC = () => {
  const loc = useLocation();

  useEffect(() => {
    pageview(loc.pathname + loc.search);
    track("nav:route_change", { path: loc.pathname, search: loc.search });
  }, [loc.pathname, loc.search]);

  useEffect(() => {
    const warmup = () => {
      const importers = [
        () => import("@/pages/AboutPage"),
        () => import("@/pages/HowItWorksPage"),
        () => import("@/pages/PricingPage"),
        () => import("@/pages/BlogIndexPage"),
        () => import("@/pages/ContactPage"),
        () => import("@/pages/FAQPage"),
        () => import("@/pages/FeedPage"),
      ];
      importers.forEach((fn) => fn().catch(() => {}));
    };
    const id = window.setTimeout(warmup, 1200);
    return () => window.clearTimeout(id);
  }, []);

  return null;
};

export default RouteChangeTracker;