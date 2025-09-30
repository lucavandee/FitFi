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

const DEFAULT_TITLE = "FitFi — AI Style Report";
const DEFAULT_DESC =
  "Ontvang direct persoonlijke outfits met uitleg en shoplinks. Rustig, premium en privacy-first.";
const DEFAULT_IMG = urls.canonicalUrl("/og/og-default.jpg"); // optioneel aanwezige OG-afbeelding
const SITE_NAME = "FitFi";

const Seo: React.FC<Props> = ({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESC,
  canonical,
  image,
  keywords,
  jsonLd,
  noIndex,
}) => {
  const canonicalHref = urls.canonicalUrl(canonical);
  const ogImage = image || DEFAULT_IMG;

  return (
    <Helmet>
      {/* Basis */}
      <title>{title}</title>
      <link rel="canonical" href={canonicalHref} />
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}

      {/* Robots */}
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large" />
      )}

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalHref} />
      {ogImage && <meta property="og:image" content={ogImage} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
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