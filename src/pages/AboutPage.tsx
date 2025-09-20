import React from "react";
import { useNavigate } from "react-router-dom";
import Seo from "@/components/Seo";
import AboutHero from "@/components/about/AboutHero";

const AboutPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <main id="main" className="bg-[var(--color-bg)] min-h-screen">
      <Seo
        title="Over FitFi — AI-gestuurde styling zonder ruis"
        description="Wij combineren computer vision met een menselijk oog voor stijl. Privacy-first advies dat werkt voor silhouet, materialen en kleurtinten."
        canonical="https://fitfi.ai/over-ons"
      />

      {/* Premium stacked hero */}
      <AboutHero
        onStart={() => navigate("/onboarding")}
        onExample={() => navigate("/results")}
      />

      {/* Editorial body (licht, rustig, tokens-first) */}
      <section className="ff-section bg-white">
        <div className="ff-container">
          <div className="grid gap-6 md:grid-cols-3">
            <article className="card card-hover p-6 rounded-[var(--radius-lg)] bg-[var(--color-surface)] border border-[var(--color-border)] shadow-[var(--shadow-soft)]">
              <h2 className="text-xl font-semibold mb-2">Waarom we FitFi bouwen</h2>
              <p className="leading-7">
                Stijl hoort helder en ontspannen te voelen. Ons doel: outfits die passen bij jouw silhouet,
                materialen en kleurtinten — zonder scroll-ruis of gokwerk.
              </p>
            </article>
            <article className="card card-hover p-6 rounded-[var(--radius-lg)] bg-[var(--color-surface)] border border-[var(--color-border)] shadow-[var(--shadow-soft)]">
              <h2 className="text-xl font-semibold mb-2">Mens + AI</h2>
              <p className="leading-7">
                Modellen vertalen jouw antwoorden, maar we toetsen alles aan een duidelijk stijlkompas
                met archetypen en seizoenslogica.
              </p>
            </article>
            <article className="card card-hover p-6 rounded-[var(--radius-lg)] bg-[var(--color-surface)] border border-[var(--color-border)] shadow-[var(--shadow-soft)]">
              <h2 className="text-xl font-semibold mb-2">Privacy-first</h2>
              <p className="leading-7">
                We vragen alleen wat nodig is en gebruiken je data uitsluitend voor jouw advies.
              </p>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
};

export default AboutPage;