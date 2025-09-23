import React from "react";
import { useNavigate } from "react-router-dom";
import Seo from "@/components/Seo";
import HowItWorksEditorial from "@/components/landing/HowItWorksEditorial";
import SkipLink from "@/components/a11y/SkipLink";

const HowItWorksPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      <SkipLink />
      <main id="main" className="bg-[var(--color-bg)] min-h-screen">
        <Seo
          title="Hoe het werkt — In 3 rustige stappen | FitFi"
          description="Beantwoord 6 korte vragen en ontvang direct je AI Style Report met outfits en shoplinks — privacy-first, zonder ruis."
          canonical="https://fitfi.ai/hoe-het-werkt"
        />

        <section className="ff-section">
          <div className="ff-container">
            <header className="section-header">
              <p className="kicker">Hoe het werkt</p>
              <h1 className="section-title">Rustig, helder en direct toepasbaar</h1>
              <p className="section-intro">
                Onze flow is kort en doordacht. In enkele minuten heb je een stijlprofiel, outfits en
                shoplinks die passen bij silhouet, materialen en kleurtemperatuur.
              </p>
            </header>

            <HowItWorksEditorial
              onStart={() => navigate("/onboarding")}
              onExample={() => navigate("/results")}
            />
          </div>
        </section>
      </main>
    </>
  );
};

export default HowItWorksPage;