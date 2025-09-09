import React from "react";
import { Helmet } from "react-helmet-async";

type Props = {
  title: string;
  description: string;
  canonical?: string;
  image?: string;
};

function Seo({ title, description, canonical, image }: Props) {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {canonical ? <link rel="canonical" href={canonical} /> : null}

      {image ? <meta property="og:image" content={image} /> : null}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />

      <meta name="twitter:card" content="summary_large_image" />
      {image ? <meta name="twitter:image" content={image} /> : null}
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  );
}

export default Seo;