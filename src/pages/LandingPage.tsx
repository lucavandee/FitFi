import React from "react";
import { Helmet } from "react-helmet-async";
import { HeroV3 } from "@/components/landing/HeroV3";
import { SocialProofV3 } from "@/components/landing/SocialProofV3";
import { RealOutfitShowcase } from "@/components/landing/RealOutfitShowcase";
import { FeatureBlocksV4 } from "@/components/landing/FeatureBlocksV4";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { StickyCTA } from "@/components/landing/StickyCTA";

export default function LandingPage() {
  return (
    <main id="main" className="bg-[var(--color-bg)] text-[var(--color-text)] overflow-hidden">
      <Helmet>
        <title>FitFi — Outfits die kloppen | AI stijladvies in 2 minuten</title>
        <meta
          name="description"
          content="AI vindt wat past. Persoonlijk Style Report met 6–12 complete outfits. 2 minuten, gratis."
        />
        <meta property="og:title" content="FitFi — Outfits die kloppen" />
        <meta
          property="og:description"
          content="AI vindt wat past. Style Report in 2 minuten, gratis."
        />
        <meta property="og:image" content="/images/c614360c-fec6-44de-89c5-497a49a852a7.webp" />
        <meta property="og:type" content="website" />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "FitFi",
            "description": "AI-powered stijladvies — Ontdek outfits die perfect bij je passen",
            "url": "https://fitfi.nl",
            "applicationCategory": "LifestyleApplication",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "EUR"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.9",
              "ratingCount": "2400",
              "bestRating": "5"
            }
          })}
        </script>
      </Helmet>

      {/* HERO V3 - Short & punchy */}
      <HeroV3 />

      {/* SOCIAL PROOF V3 - Testimonials FIRST for credibility */}
      <SocialProofV3 />

      {/* REAL OUTFIT SHOWCASE - Actual clothing items */}
      <RealOutfitShowcase />

      {/* FEATURE BLOCKS V4 - Reduced to 2 (Color + Speed) */}
      <FeatureBlocksV4 />

      {/* FINAL CTA - Big conversion push */}
      <FinalCTA />

      {/* STICKY CTA - Always accessible after scroll */}
      <StickyCTA />

    </main>
  );
}
