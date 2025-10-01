import React from "react";
import { useNavigate } from "react-router-dom";
import Seo from "@/components/Seo";
import HeroStacked from "@/components/landing/HeroStacked";
import HowItWorksEditorial from "@/components/landing/HowItWorksEditorial";
import SocialProofEditorial from "@/components/landing/SocialProofEditorial";
import SkipLink from "@/components/a11y/SkipLink";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  // JSON-LD voor de homepage (WebSite + Organization + SearchAction)
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "FitFi",
      "url": "https://www.fitfi.ai/",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://www.fitfi.ai/?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "FitFi",
      "url": "https://www.fitfi.ai/",
      "logo": "https://www.fitfi.ai/og/og-default.jpg",
      "sameAs": [
        "https://www.instagram.com/",
        "https://www.linkedin.com/"
      ]
    }
  ];

  return (
    <>
      <SkipLink />
      <main id="main" className="bg-[var(--color-bg)] min-h-screen">
        <Seo
          title="FitFi — AI Style Report"
          description="Antwoord op 6 korte vragen en ontvang direct persoonlijke outfits met uitleg en shoplinks. Rustig, premium en privacy-first."
          canonical="/"
          jsonLd={jsonLd}
          image="https://www.fitfi.ai/og/og-default.jpg"
          // géén styling-aanpassing; puur meta
        />

        {/* HERO (ongewijzigde styling) */}
        <section className="ff-section">
          <div className="ff-container">
            <HeroStacked
              onStart={() => navigate("/results")}
              onExample={() => navigate("/hoe-het-werkt")}
              // imageId/alt/focal blijven zoals jouw component default — geen visuele wijziging
            />
          </div>
        </section>

        {/* Uitleg (ongewijzigd) */}
        <section className="ff-section">
          <div className="ff-container">
            <HowItWorksEditorial />
          </div>
        </section>

        {/* Social proof / trust (ongewijzigd) */}
        <section className="ff-section">
          <div className="ff-container">
            <SocialProofEditorial />
          </div>
        </section>
      </main>
    </>
  );
};

export default LandingPage;