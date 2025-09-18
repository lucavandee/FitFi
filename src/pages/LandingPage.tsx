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
        ogImage="/images/social/home-og.jpg"
      />

      <Hero onCTAClick={() => navigate("/onboarding")} />

      <section className="ff-section ff-container">
        <HowItWorksSnippet />
      </section>

      <section className="ff-section alt-bg">
        <div className="ff-container">
          <FeaturesTrio />
        </div>
      </section>

      <section className="ff-section ff-container">
        <SocialProofEditorial />
      </section>
    </main>
  );
};

export default LandingPage;