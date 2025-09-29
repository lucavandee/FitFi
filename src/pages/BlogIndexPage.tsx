import React from "react";
import Seo from "@/components/Seo";
import SectionHeader from "@/components/marketing/SectionHeader";

// Bestaande imports:
// import { BlogList } from "@/components/blog/BlogList"; etc.

const BlogIndexPage: React.FC = () => {
  return (
    <>
      <Seo
        title="Blog — FitFi"
        description="Artikelen over stijl, outfits en AI-gedreven styling. Van psychologische inzichten tot praktische stijltips."
        canonical="/blog"
        image={`${urls.CANONICAL_HOST}/og-blog.jpg`}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Blog",
          name: "FitFi Blog",
          url: urls.canonicalUrl("/blog"),
        }}
      />

      <main className="min-h-screen bg-[var(--color-bg)]">
        <SectionHeader
          eyebrow="INSIGHTS"
          title="Blog"
          subtitle="Praktische stijltips, psychologie achter kleding en AI-styling in eenvoudig Nederlands."
          align="left"
          as="h1"
        />

        {/* Bestaande blog index UI ongewijzigd */}
        {/* <BlogList /> etc. */}
      </main>
    </>
  );
};

export default BlogIndexPage;