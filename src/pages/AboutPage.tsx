import React from "react";
import { useNavigate } from "react-router-dom";
import Seo from "@/components/Seo";
import AboutHero from "@/components/about/AboutHero";
import TeamSection from "@/components/about/TeamSection";
import Timeline from "@/components/about/Timeline";
import SkipLink from "@/components/a11y/SkipLink";

const AboutPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      <SkipLink />
      <main id="main" className="bg-[var(--color-bg)] min-h-screen">
        <Seo
          title="Over FitFi — AI-gestuurde styling zonder ruis"
          description="Wij combineren computer vision met een menselijk oog voor stijl. Privacy-first advies dat werkt voor silhouet, materialen en kleurtinten."
          canonical="https://fitfi.ai/over-ons"
          preloadImages={["/images/hero/main.jpg"]}
        />

        <AboutHero
          onStart={() => navigate("/onboarding")}
          onExample={() => navigate("/results")}
        />

        <TeamSection />
        <Timeline />
      </main>
    </>
  );
};

export default AboutPage;