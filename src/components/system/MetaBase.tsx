import React from "react";
import { Helmet } from "react-helmet-async";

/**
 * Base meta tags voor alle pagina's - SEO fundamentals
 */
const MetaBase: React.FC = () => {
  return (
    <Helmet>
      <html lang="nl" />
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#F7F3EC" />
      
      {/* Preconnect voor performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* PWA manifest */}
      <link rel="manifest" href="/manifest.webmanifest" />
      
      {/* Icons */}
      <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192.png" />
      <link rel="icon" type="image/png" sizes="512x512" href="/icons/icon-512.png" />
      <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      
      {/* Default OG fallbacks */}
      <meta property="og:site_name" content="FitFi" />
      <meta property="og:locale" content="nl_NL" />
      <meta name="twitter:site" content="@fitfi_nl" />
    </Helmet>
  );
};

export default MetaBase;