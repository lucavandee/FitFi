import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop
 * - Scrollt naar top bij routewijziging (pathname of hash).
 * - Respecteert hash anchors: als er een hash is, laat native browser-scroll het afhandelen.
 */
const ScrollToTop: React.FC = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // Als er een hash is, laat de browser naar het element scrollen.
    if (hash) return;

    // Smooth maar toegankelijk; reduce-motion users krijgen instant.
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: prefersReduced ? "auto" : "smooth",
    });
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;