import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SeoProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  keywords?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  noIndex?: boolean;
  noFollow?: boolean;
  canonical?: string;
  jsonLd?: object;
}

const Seo: React.FC<SeoProps> = ({
  title = 'FitFi - AI-Powered Personal Styling',
  description = 'Ontdek jouw perfecte stijl met AI-powered personal styling. Gepersonaliseerde outfit aanbevelingen die perfect bij jouw persoonlijkheid passen.',
  image = 'https://fitfi.app/og-default.jpg',
  url,
  type = 'website',
  keywords = 'AI styling, personal stylist, outfit aanbevelingen, mode advies, stijl quiz, Nederlandse fashion',
  author = 'FitFi Team',
  publishedTime,
  modifiedTime,
  section,
  tags = [],
  noIndex = false,
  noFollow = false,
  canonical,
  jsonLd
}) => {
  // Get current URL if not provided
  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : 'https://fitfi.app');
  
  // Ensure title includes brand name
  const fullTitle = title.includes('FitFi') ? title : `${title} | FitFi`;
  
  // Generate structured data for articles
  const structuredData = type === 'article' ? {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": description,
    "image": image,
    "author": {
      "@type": "Organization",
      "name": author
    },
    "publisher": {
      "@type": "Organization",
      "name": "FitFi",
      "logo": {
        "@type": "ImageObject",
        "url": "https://fitfi.app/logo.png"
      }
    },
    "datePublished": publishedTime,
    "dateModified": modifiedTime || publishedTime,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": currentUrl
    }
  } : null;

  // Generate organization structured data for website pages
  const organizationData = type === 'website' ? {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "FitFi",
    "url": "https://fitfi.app",
    "logo": "https://fitfi.app/logo.png",
    "description": "AI-powered personal styling platform voor gepersonaliseerde outfit aanbevelingen",
    "sameAs": [
      "https://www.instagram.com/xfitfi/",
      "https://www.linkedin.com/company/fitfi-ai"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+31-6-203-709-68",
      "contactType": "customer service",
      "email": "info@fitfi.ai"
    }
  } : null;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      {author && <meta name="author" content={author} />}
      
      {/* Robots Meta */}
      {(noIndex || noFollow) && (
        <meta name="robots" content={`${noIndex ? 'noindex' : 'index'},${noFollow ? 'nofollow' : 'follow'}`} />
      )}
      
      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={canonical} />}
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="FitFi" />
      <meta property="og:locale" content="nl_NL" />
      
      {/* Article specific Open Graph */}
      {type === 'article' && (
        <>
          {author && <meta property="article:author" content={author} />}
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
          {section && <meta property="article:section" content={section} />}
          {tags.map(tag => (
            <meta key={tag} property="article:tag" content={tag} />
          ))}
        </>
      )}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:site" content="@fitfi_app" />
      <meta name="twitter:creator" content="@fitfi_app" />
      
      {/* Additional Meta */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#89CFF0" />
      <meta name="msapplication-TileColor" content="#89CFF0" />
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
      
      {organizationData && (
        <script type="application/ld+json">
          {JSON.stringify(organizationData)}
        </script>
      )}
      
      {/* Custom JSON-LD */}
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      )}
    </Helmet>
  );
};

export default Seo;