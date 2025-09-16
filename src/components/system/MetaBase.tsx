import React from "react";
import { Helmet } from "react-helmet-async";

/**
 * Base meta tags die op elke pagina aanwezig zijn.
 * Pagina-specifieke SEO via <Seo> component.
 */
const MetaBase: React.FC = () => {
  return (
    <Helmet>
      <html lang="nl" />
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#A6886A" />
      
      {/* Base meta */}
      <meta name="robots" content="index, follow" />
      <meta name="author" content="FitFi" />
      <meta name="generator" content="FitFi vNext" />
      
      {/* Preconnect voor performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* Manifest */}
      <link rel="manifest" href="/manifest.json" />
      
      {/* Icons */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192.png" />
      <link rel="apple-touch-icon" sizes="512x512" href="/icons/icon-512.png" />
      
      {/* Default OG fallbacks */}
      <meta property="og:site_name" content="FitFi" />
      <meta property="og:locale" content="nl_NL" />
      <meta name="twitter:site" content="@fitfi" />
    </Helmet>
  );
};

export default MetaBase;