import React from "react";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * NavigationServiceInitializer
 * - Luistert naar route-wissels en vuurt een CustomEvent voor interne services/analytics.
 * - Geen harde dependency op services; volledig optioneel/veilig.
 */
const NavigationServiceInitializer: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    // Optioneel: interne hook voor je eigen service
    if (typeof window !== "undefined") {
      const detail = {
        path: `${location.pathname}${location.search}${location.hash}`,
        ts: Date.now(),
      };

      // CustomEvent voor listeners (bv. analytics, nova, etc.)
      window.dispatchEvent(new CustomEvent("fitfi:navigate", { detail }));

      // Als je later een globale service wilt aanroepen zonder hard import:
      // (window as any).__navService?.track?.(detail);
    }
  }, [location.pathname, location.search, location.hash]);

  return null;
};

export default NavigationServiceInitializer;