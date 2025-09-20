import React from "react";
import { useNavigate } from "react-router-dom";
import Seo from "@/components/Seo";
import HeroStacked from "@/components/landing/HeroStacked";
import HowItWorksEditorial from "@/components/landing/HowItWorksEditorial";
import SocialProofEditorial from "@/components/landing/SocialProofEditorial";
import Footer from "@/components/layout/Footer";

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

      <HeroStacked
        focal="50% 38%"
        onStart={() => navigate("/onboarding")}
        onExample={() => navigate("/results")}
      />

      <section className="ff-section bg-[var(--color-bg)]">
        <div className="ff-container">
          <HowItWorksEditorial
            onStart={() => navigate("/onboarding")}
            onExample={() => navigate("/results")}
          />
        </div>
      </section>

      <section className="ff-section bg-white">
        <div className="ff-container">
          <SocialProofEditorial />
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default LandingPage;