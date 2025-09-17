import React from "react";
import { Helmet } from "react-helmet-async";

export interface SeoProps {
  title?: string;
  description?: string;
  canonical?: string;
  preloadImages?: string[]; // absolute of root-relative paden
}

const Seo: React.FC<SeoProps> = ({ title, description, canonical, preloadImages = [] }) => {
  return (
    <Helmet>
      {title ? <title>{title}</title> : null}
      {description ? <meta name="description" content={description} /> : null}
      {canonical ? <link rel="canonical" href={canonical} /> : null}

      {/* Preload kritieke hero-afbeeldingen (LCP) */}
      {preloadImages.map((href, i) => (
        <link key={i} rel="preload" as="image" href={href} fetchpriority="high" />
      ))}
    </Helmet>
  );
};

export default Seo;