import React from "react";
import { Helmet } from "react-helmet-async";

export interface SeoProps {
  title?: string;
  description?: string;
  canonical?: string;
  preloadImages?: string[];
  ogImage?: string; // optioneel: absolute of root-relative path
  ogType?: string; // default: "website"
  twitterCard?: string; // default: "summary_large_image"
  siteName?: string; // voor og:site_name
  locale?: string; // voor og:locale
}

const DEFAULT_TITLE = "FitFi — AI Style Report";
const DEFAULT_DESCRIPTION = "Ontdek in 2 minuten welke outfits écht bij je passen. Gratis AI Style Report met persoonlijke stijladvies en slimme shoplinks.";
const DEFAULT_OG_IMAGE = "/images/og-default.jpg";
const DEFAULT_SITE_NAME = "FitFi";
const DEFAULT_LOCALE = "nl_NL";

const Seo: React.FC<SeoProps> = ({ 
  title, 
  description, 
  canonical, 
  preloadImages = [], 
  ogImage,
  ogType = "website",
  twitterCard = "summary_large_image",
  siteName = DEFAULT_SITE_NAME,
  locale = DEFAULT_LOCALE
}) => {
  // Fallback naar defaults als props leeg zijn
  const finalTitle = title || DEFAULT_TITLE;
  const finalDescription = description || DEFAULT_DESCRIPTION;
  const finalOgImage = ogImage || DEFAULT_OG_IMAGE;

  return (
    <Helmet>
      {/* Basic meta tags */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      {canonical && <link rel="canonical" href={canonical} />}
      
      {/* Viewport en charset (altijd aanwezig) */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta charSet="utf-8" />

      {/* Open Graph meta tags */}
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={finalOgImage} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={locale} />
      {canonical && <meta property="og:url" content={canonical} />}

      {/* Twitter Card meta tags */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalOgImage} />
      <meta name="twitter:site" content="@fitfi_nl" />
      <meta name="twitter:creator" content="@fitfi_nl" />

      {/* Additional SEO meta tags */}
      <meta name="robots" content="index, follow" />
      <meta name="author" content="FitFi" />
      <meta name="theme-color" content="var(--color-primary)" />
      
      {/* Preload hero/LCP images voor performance */}
      {preloadImages.map((href, i) => (
        <link 
          key={i} 
          rel="preload" 
          as="image" 
          href={href} 
          fetchPriority="high"
        />
      ))}

      {/* DNS prefetch voor externe resources */}
      <link rel="dns-prefetch" href="//images.unsplash.com" />
      <link rel="dns-prefetch" href="//cdn.jsdelivr.net" />
    </Helmet>
  );
};

export default Seo;