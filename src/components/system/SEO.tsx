import React from 'react';
import { Helmet } from 'react-helmet-async';

type Props = {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  locale?: string;
  type?: 'website' | 'article';
};

const DEFAULTS = {
  title: 'FitFi — AI Style Report',
  description:
    'Ontdek in 2 minuten welke outfits écht bij je passen. Persoonlijk stijlprofiel met outfits en shoplinks — privacy-first, zonder ruis.',
  canonical: 'https://fitfi.ai/',
  ogImage: '/images/og-default.jpg',
  locale: 'nl_NL',
  type: 'website' as const,
};

export default function SEO(props: Props) {
  const { title, description, canonical, ogImage, locale, type } = { ...DEFAULTS, ...props };

  return (
    <Helmet>
      <html lang="nl" />
      <title>{title}</title>
      <meta name="description" content={description} />
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph / Twitter */}
      <meta property="og:site_name" content="FitFi" />
      <meta property="og:type" content={type} />
      <meta property="og:locale" content={locale} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      {canonical && <meta property="og:url" content={canonical} />}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@fitfi_nl" />
      <meta name="twitter:creator" content="@fitfi_nl" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}

      {/* Thema-kleur via tokens */}
      <meta name="theme-color" content="var(--ff-color-primary)" />
      <meta name="robots" content="index, follow" />
      <meta name="author" content="FitFi" />
      {/* Preconnects */}
      <link rel="dns-prefetch" href="//images.unsplash.com" />
      <link rel="dns-prefetch" href="//cdn.jsdelivr.net" />
    </Helmet>
  );
}