import React from "react";
import { useNavigate } from "react-router-dom";
import Seo from "@/components/Seo";
import Hero from "@/components/landing/Hero";
import HowItWorksSnippet from "@/components/landing/HowItWorksSnippet";
import FeaturesTrio from "@/components/landing/FeaturesTrio";
import SocialProofEditorial from "@/components/landing/SocialProofEditorial";
import Footer from "@/components/layout/Footer";
import SkipLink from "@/components/a11y/SkipLink";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  // JSON-LD: Organization
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "FitFi",
    "url": "https://fitfi.ai/",
    // Optioneel: voeg hier een bestaand logo toe zodra je pad zeker is (bijv. /logo.svg of /favicon-512.png)
    // "logo": "https://fitfi.ai/logo.svg",
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "contactType": "customer support",
        "email": "hello@fitfi.ai",
        "availableLanguage": ["nl", "en"]
      }
    ]
  };

  // JSON-LD: WebSite + SearchAction (wijst naar FAQ met query-parameter; backend niet vereist)
  const siteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "url": "https://fitfi.ai/",
    "inLanguage": "nl-NL",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://fitfi.ai/faq?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <>
      <SkipLink />
      <main id="main" className="bg-[var(--color-bg)] min-h-screen">
        <Seo
          title="AI Style Report — Ontdek wat jouw stijl over je zegt | FitFi"
          description="Krijg je gratis AI Style Report in 2 minuten: ontdek wat je kledingkeuzes zeggen over je persoonlijkheid en ontvang passende outfits met shoplinks."
          canonical="https://fitfi.ai/"
          preloadImages={["/images/hero/main.jpg"]}
        />

        {/* JSON-LD blokken voor Organization + WebSite */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
        />

        {/* Hero */}
        <Hero onCTAClick={() => navigate("/onboarding")} />

        {/* How it works */}
        <section className="ff-section bg-white">
          <div className="ff-container">
            <HowItWorksSnippet />
          </div>
        </section>

        {/* Features trio */}
        <section className="ff-section bg-[var(--color-bg)]">
          <div className="ff-container">
            <FeaturesTrio />
          </div>
        </section>

        {/* Social proof */}
        <section className="ff-section bg-white">
          <div className="ff-container max-w-5xl">
            <SocialProofEditorial />
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
};

export default LandingPage;