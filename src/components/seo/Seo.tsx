// /src/components/seo/Seo.tsx
import React from "react";
import { Helmet } from "react-helmet-async";

type Props = {
  title: string;
  description?: string;
  /** Relatieve path beginnend met '/', bv. '/inloggen' */
  path?: string;
  noindex?: boolean;
  ogImage?: string;
  structuredData?: object;
};

function canonicalUrl(path?: string) {
  const base =
    import.meta.env.VITE_CANONICAL_HOST ||
    (typeof window !== "undefined" ? window.location.origin : "");
  const p = path || (typeof window !== "undefined" ? window.location.pathname : "/");
  const joined = (base?.replace(/\/$/, "") || "") + (p?.startsWith("/") ? p : `/${p || ""}`);
  return joined || "";
}

export default function Seo({ title, description, path, noindex, ogImage, structuredData }: Props) {
  const url = canonicalUrl(path);
  const ld = structuredData ? JSON.stringify(structuredData) : null;

  return (
    <Helmet>
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      {url && <link rel="canonical" href={url} />}

      <meta property="og:site_name" content="FitFi" />
      <meta property="og:type" content="website" />
      {url && <meta property="og:url" content={url} />}
      <meta property="og:title" content={title} />
      {description && <meta property="og:description" content={description} />}
      {ogImage && <meta property="og:image" content={ogImage} />}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      {description && <meta name="twitter:description" content={description} />}
      {ogImage && <meta name="twitter:image" content={ogImage} />}

      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {ld && <script type="application/ld+json">{ld}</script>}
    </Helmet>
  );
}