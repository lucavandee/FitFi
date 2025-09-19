import React from "react";
import { useNavigate } from "react-router-dom";
import Seo from "@/components/Seo";
import Hero from "@/components/landing/Hero";
import HowItWorksEditorial from "@/components/landing/HowItWorksEditorial";
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

      {/* Hero met art-directed focal point (pas aan naargelang je beeld) */}
      <Hero
        focal="50% 35%"
        onCTAClick={() => navigate("/onboarding")}
        onSecondaryClick={() => navigate("/results")}
      />

      {/* How it works */}
      <HowItWorksEditorial
        onStart={() => navigate("/onboarding")}
        onExample={() => navigate("/results")}
      />

      {/* Social proof */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SocialProofEditorial />
        </div>
      </section>
    </main>
  );
};

export default LandingPage;