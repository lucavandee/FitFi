import React from "react";
import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  ogImage?: string;
  noIndex?: boolean;
  canonical?: string;
  keywords?: string;
}

export function SEO({
  title,
  description,
  ogImage,
  noIndex,
  canonical,
  keywords,
}: SEOProps) {
  const fullTitle = title ? `${title} • FitFi` : "FitFi";

  return (
    <Helmet>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      {keywords && <meta name="keywords" content={keywords} />}
      {noIndex && <meta name="robots" content="noindex,nofollow" />}
      {canonical && <link rel="canonical" href={canonical} />}
      {ogImage && <meta property="og:image" content={ogImage} />}
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      {description && <meta name="twitter:description" content={description} />}
      {ogImage && <meta name="twitter:image" content={ogImage} />}
    </Helmet>
  );
}

export default SEO;
