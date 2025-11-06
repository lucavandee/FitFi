import React from "react";
import { Helmet } from "react-helmet-async";
import { HeroV3 } from "@/components/landing/HeroV3";
import { OutfitShowcaseV3 } from "@/components/landing/OutfitShowcaseV3";
import { FeatureBlocksV3 } from "@/components/landing/FeatureBlocksV3";
import { AnimatedFlow } from "@/components/landing/AnimatedFlow";
import { SocialProofV3 } from "@/components/landing/SocialProofV3";
import { FAQVisual } from "@/components/landing/FAQVisual";
import { FinalCTA } from "@/components/landing/FinalCTA";
import "@/styles/landing-animations.css";

export default function LandingPage() {
  return (
    <main id="main" className="bg-[var(--color-bg)] text-[var(--color-text)] overflow-hidden">
      <Helmet>
        <title>FitFi — Ontdek outfits die perfect bij je passen | AI-powered stijladvies</title>
        <meta
          name="description"
          content="Persoonlijk Style Report met kleuren die flatteren, snit die respecteert, en 6–12 complete looks. In 2 minuten. Gratis start, privacy-first."
        />
        <meta property="og:title" content="FitFi — Ontdek outfits die perfect bij je passen" />
        <meta
          property="og:description"
          content="AI-powered stijladvies in 2 minuten. Krijg je persoonlijke Style Report met outfits die kloppen."
        />
        <meta property="og:image" content="/hero/hero-style-report-lg.webp" />
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

      {/* HERO V3 - Full-screen with local image */}
      <HeroV3 />

      {/* OUTFIT SHOWCASE V3 - CSS gradient cards */}
      <OutfitShowcaseV3 />

      {/* FEATURE BLOCKS V3 - Visual gradient blocks */}
      <FeatureBlocksV3 />

      {/* ANIMATED FLOW - How it works */}
      <AnimatedFlow />

      {/* SOCIAL PROOF V3 - Testimonials with gradient avatars */}
      <SocialProofV3 />

      {/* FAQ - Visual accordion */}
      <FAQVisual />

      {/* FINAL CTA - Big conversion push */}
      <FinalCTA />

    </main>
  );
}
