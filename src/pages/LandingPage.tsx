import React, { Suspense, lazy } from "react";
import { Helmet } from "react-helmet-async";
import { HeroV3 } from "@/components/landing/HeroV3";
import { SocialProofV3 } from "@/components/landing/SocialProofV3";

const StyleReportPreviewCard = lazy(() =>
  import("@/components/landing/StyleReportPreviewCard").then((m) => ({ default: m.StyleReportPreviewCard }))
);
const TrustBlock = lazy(() =>
  import("@/components/landing/TrustBlock").then((m) => ({ default: m.TrustBlock }))
);
const RealOutfitShowcase = lazy(() =>
  import("@/components/landing/RealOutfitShowcase").then((m) => ({ default: m.RealOutfitShowcase }))
);
const FeatureBlocksV4 = lazy(() =>
  import("@/components/landing/FeatureBlocksV4").then((m) => ({ default: m.FeatureBlocksV4 }))
);
const FinalCTA = lazy(() =>
  import("@/components/landing/FinalCTA").then((m) => ({ default: m.FinalCTA }))
);
import { StickyCTA } from "@/components/landing/StickyCTA";

/**
 * Landing Page - Benefits-Driven & Accessible
 *
 * WCAG 2.1 AA Compliant:
 * - Skip-to-content link for keyboard users
 * - Semantic HTML with proper landmarks
 * - Clear value proposition (not vague promises)
 * - Social proof for credibility
 * - Mobile-optimized CTAs in thumb zone
 */
export default function LandingPage() {
  return (
    <>
      <Helmet>
        <title>FitFi — Persoonlijk stijladvies in 2 minuten</title>
        <meta
          name="description"
          content="In 2 minuten een stijlrapport dat je écht helpt kiezen wat je aantrekt. Outfits voor werk, weekend en uitgaan + directe shoplinks. Gratis start."
        />
        <meta property="og:title" content="FitFi — Persoonlijk stijladvies in 2 minuten" />
        <meta
          property="og:description"
          content="Stijlrapport met outfits voor werk, weekend en uitgaan. We vertalen jouw voorkeuren naar combinaties die écht passen."
        />
        <meta property="og:image" content="/images/c614360c-fec6-44de-89c5-497a49a852a7.webp" />
        <meta property="og:type" content="website" />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "FitFi",
            "description": "Persoonlijk stijladvies in 2 minuten. Ontdek outfits die bij je passen en shop ze direct.",
            "url": "https://fitfi.nl",
            "applicationCategory": "LifestyleApplication",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "EUR"
            }
          })}
        </script>
      </Helmet>

      {/* Skip to main content link - A11Y */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-6 focus:py-3 focus:bg-[var(--ff-color-primary-700)] focus:text-white focus:rounded-xl focus:shadow-2xl focus:font-semibold"
      >
        Spring naar hoofdinhoud
      </a>

      <main id="main-content" className="bg-[var(--color-bg)] text-[var(--color-text)] overflow-x-hidden w-full">
        <HeroV3 />
        <SocialProofV3 />
        <Suspense fallback={<div className="h-48" />}>
          <StyleReportPreviewCard />
          <TrustBlock />
          <RealOutfitShowcase />
          <FeatureBlocksV4 />
          <FinalCTA />
        </Suspense>
        <StickyCTA />
      </main>
    </>
  );
}
