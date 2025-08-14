import React from 'react';
import { Helmet } from 'react-helmet-async';

type SeoProps = {
  title?: string;
  description?: string;
  canonical?: string;
  noindex?: boolean;
  jsonLd?: Record<string, any> | Record<string, any>[];
};

const SITE_NAME = 'FitFi';
const ORIGIN = typeof window !== 'undefined' ? window.location.origin : 'https://www.fitfi.ai';

export default function Seo({
  title = 'FitFi — AI Personal Styling',
  description = 'Ontdek welke stijl bij je past met ons AI-gedreven stylingplatform. In 2 minuten een persoonlijk rapport en shopbare outfits.',
  canonical,
  noindex = false,
  jsonLd
}: SeoProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const url = canonical ?? (typeof window !== 'undefined' ? window.location.href : ORIGIN);

  const ld = Array.isArray(jsonLd) ? jsonLd : (jsonLd ? [jsonLd] : []);

  return (
    <Helmet>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      {canonical && <link rel="canonical" href={canonical} />}
      {noindex && <meta name="robots" content="noindex,nofollow" />}

      {/* Open Graph */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />

      {/* JSON-LD */}
      {ld.map((obj, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(obj) }} />
      ))}
    </Helmet>
  );
}