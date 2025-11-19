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
        <title>FitFi — Outfits voor jou | AI stijladvies</title>
        <meta
          name="description"
          content="Vind je stijl. Style Report met outfits die bij je passen."
        />
        <meta property="og:title" content="FitFi — Outfits voor jou" />
        <meta
          property="og:description"
          content="Stijladvies op basis van je voorkeuren."
        />
        <meta property="og:image" content="/images/c614360c-fec6-44de-89c5-497a49a852a7.webp" />
        <meta property="og:type" content="website" />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "FitFi",
            "description": "Stijladvies op basis van je voorkeuren",
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
