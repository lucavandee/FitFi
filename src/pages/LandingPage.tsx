import React from "react";
import { useNavigate } from "react-router-dom";
import Seo from "@/components/Seo";
import Hero from "@/components/landing/Hero";
import HowItWorksSnippet from "@/components/landing/HowItWorksSnippet";
import FeaturesTrio from "@/components/landing/FeaturesTrio";
import SocialProofEditorial from "@/components/landing/SocialProofEditorial";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <main id="main" className="bg-[var(--color-bg)] min-h-screen">
      <Seo
        title="AI Style Report — Ontdek wat jouw stijl over je zegt | FitFi"
        description="Krijg je gratis AI Style Report in 2 minuten: ontdek wat je kledingkeuzes zeggen over je persoonlijkheid en ontvang passende outfits met shoplinks."
        canonical="https://fitfi.ai/"
        preloadImages={["/images/hero/main.jpg"]}
      />

      <Hero onCTAClick={() => navigate("/onboarding")} />

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <HowItWorksSnippet />
        </div>
      </section>

      <section className="py-16 bg-[var(--color-bg)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FeaturesTrio />
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SocialProofEditorial />
        </div>
      </section>
    </main>
  );
};

export default LandingPage;