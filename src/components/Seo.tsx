import React from "react";
import { Helmet } from "react-helmet-async";

type SeoProps = {
  title?: string;
  description?: string;
  canonical?: string;
  noindex?: boolean;
  jsonLd?: Record<string, any> | Record<string, any>[];
  keywords?: string;
  type?: "website" | "article";
  image?: string;
};

const SITE_NAME = "FitFi";
const ORIGIN =
  typeof window !== "undefined" ? window.location.origin : "https://fitfi.app";
const DEFAULT_IMAGE = `${ORIGIN}/og-default.jpg`;
const DEFAULT_DESCRIPTION =
  "Ontdek welke stijl bij je past met ons AI-gedreven stylingplatform. In 2 minuten een persoonlijk rapport en shopbare outfits.";

export default function Seo({
  title,
  description = DEFAULT_DESCRIPTION,
  canonical,
  noindex = false,
  jsonLd,
  keywords,
  type = "website",
  image,
}: SeoProps) {
  const fullTitle = title
    ? `${title} | ${SITE_NAME}`
    : `${SITE_NAME} — AI Personal Styling`;
  const url =
    canonical ??
    (typeof window !== "undefined" ? window.location.href : ORIGIN);
  const ogImage = image || DEFAULT_IMAGE;

  const ld = Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : [];

  return (
    <Helmet>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={canonical || url} />
      {noindex && <meta name="robots" content="noindex,nofollow" />}
      {!noindex && <meta name="robots" content="index,follow" />}

      {/* Open Graph */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="nl_NL" />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:site" content="@fitfi_ai" />

      {/* JSON-LD */}
      {ld.map((obj, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(obj) }}
        />
      ))}
    </Helmet>
  );
}
