import React from "react";
import { useNavigate } from "react-router-dom";
import Seo from "@/components/Seo";
import Hero from "@/components/landing/Hero";
import SocialProof from "@/components/landing/SocialProof";

// NB: We houden het licht: HowItWorks/Features kunnen apart opgepoetst worden.
// Deze pagina focust op LCP/CTR (hero + trust) en blijft tokens-first.

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleCTAClick = () => {
    navigate("/onboarding");
  };

  return (
    <div className="min-h-screen bg-[color:var(--color-bg)]">
      <Seo
        title="AI Style Report — Ontdek wat jouw stijl over je zegt | FitFi"
        description="Krijg je gratis AI Style Report in 2 minuten: ontdek wat je kledingkeuzes zeggen over je persoonlijkheid en ontvang passende outfits met shoplinks."
        preloadImages={["/images/hero/main.jpg"]}
        canonical="https://fitfi.ai/"
      />

      {/* Hero met sterke trust direct naast CTA (uit Hero-component) */}
      <Hero onCTAClick={handleCTAClick} />

      {/* Social proof dicht op de hero voor hogere CTR en vertrouwen */}
      <SocialProof />

      {/* Footer wordt elders gerenderd via layout, of voeg hier een sectie toe indien nodig */}
    </div>
  );
};

export default LandingPage;