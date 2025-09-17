import React from "react";
import { useNavigate } from "react-router-dom";
import Seo from "@/components/Seo";
import Hero from "@/components/landing/Hero";
import { track } from "@/utils/analytics";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleCTAClick = () => {
    track("landing:cta-click", {
      source: "hero",
      destination: "onboarding"
    });
    navigate("/onboarding");
  };

  return (
    <div className="min-h-screen bg-[color:var(--color-bg)]">
      <Seo
        title="AI Style Report — Ontdek wat jouw stijl over je zegt | FitFi"
        description="Krijg je gratis AI Style Report in 2 minuten: ontdek wat je kledingkeuzes zeggen over je persoonlijkheid en ontvang passende outfits met shoplinks."
        canonical="https://fitfi.ai/"
        preloadImages={["/images/hero/main.jpg"]}
      />

      <Hero onCTAClick={handleCTAClick} />

      {/* Premium, clean design - uitbreidbaar met How-it-Works of Social Proof */}
    </div>
  );
};

export default LandingPage;