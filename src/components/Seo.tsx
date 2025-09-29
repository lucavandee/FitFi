// src/components/Seo.tsx
import React from "react";
import { Helmet } from "react-helmet-async";
import urls from "@/utils/urls";

type JsonLd = Record<string, unknown> | Array<Record<string, unknown>>;

type Props = {
  title?: string;
  description?: string;
  canonical?: string;       // pad of volledige URL
  image?: string;           // absolute URL aangeraden
  keywords?: string;        // comma-separated
  jsonLd?: JsonLd;          // gestructureerde data
  noIndex?: boolean;        // robots noindex
};

const Seo: React.FC<Props> = ({
  title,
  description,
  canonical,
  image,
  keywords,
  jsonLd,
  noIndex,
}) => {
  const canonicalHref = urls.canonicalUrl(canonical);
  const ogImage = image || `${urls.CANONICAL_HOST}/og-default.jpg`;

  // Twitter kaarttype afleiden van afbeelding (simpel: altijd summary_large_image).
  const twitterCard = "summary_large_image";

  return (
    <Helmet>
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}
      {keywords && <meta name="keywords" content={keywords} />}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* Canonical */}
      <link rel="canonical" href={canonicalHref} />

      {/* Open Graph */}
      <meta property="og:url" content={canonicalHref} />
      {title && <meta property="og:title" content={title} />}
      {description && <meta property="og:description" content={description} />}
      <meta property="og:type" content="website" />
      {ogImage && <meta property="og:image" content={ogImage} />}

      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      {title && <meta name="twitter:title" content={title} />}
      {description && <meta name="twitter:description" content={description} />}
      {ogImage && <meta name="twitter:image" content={ogImage} />}

      {/* JSON-LD */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
};

export default Seo;