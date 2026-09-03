import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop
 * - Springt direct naar top bij routewijziging (pathname).
 * - Altijd instant: bij smooth vliegt de vorige pagina in beeld langs en tonen
 *   secties die op scrollY reageren een zichtbaar verkeerde tussenstand.
 * - Respecteert hash anchors: als er een hash is, laat native browser-scroll het afhandelen.
 */
const ScrollToTop: React.FC = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // Als er een hash is, laat de browser naar het element scrollen.
    if (hash) return;

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;