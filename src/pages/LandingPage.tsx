import React from "react";
import { useNavigate } from "react-router-dom";
import Seo from "@/components/Seo";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import Features from "@/components/landing/Features";
import SocialProof from "@/components/landing/SocialProof";
import Footer from "@/components/layout/Footer";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleCTAClick = () => {
    // Conversie-eventen kunnen via utils/analytics, maar we houden het hier lightweight
    navigate("/onboarding");
  };

  return (
    <div className="min-h-screen bg-[color:var(--color-bg)]">
      <Seo
        title="AI Style Report — Ontdek wat jouw stijl over je zegt"
        description="Krijg je gratis AI Style Report in 2 minuten: zie wat je kledingkeuzes over je zeggen en ontvang direct passende outfits."
      />

      <Hero onCTAClick={handleCTAClick} />

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <HowItWorks />
        </div>
      </section>

      <section className="py-16 bg-[color:var(--color-bg)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Features />
        </div>
      </section>

      <SocialProof />

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Footer />
        </div>
      </section>
    </div>
  );
};

export default LandingPage;