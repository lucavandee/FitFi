import React from "react";
import Seo from "@/components/Seo";

const HowItWorksPage: React.FC = () => {
  return (
    <>
      <Seo
        title="Hoe het werkt — AI Style Report in 2 minuten | FitFi"
        description="Zo werkt FitFi: beantwoord een korte stijlquiz, ontvang je AI Style Report en shop direct 'the look' met passende items."
        canonical="https://fitfi.ai/hoe-het-werkt"
      />

      {/* Hero / Intro */}
      <section className="ff-section bg-white">
        <div className="ff-container">
          <header className="max-w-3xl">
            <h1 className="ff-h1">Hoe het werkt</h1>
            <p className="ff-lead text-[var(--color-muted)]">
              Drie stappen. Twee minuten. Jouw stijl, helder.
            </p>
          </header>
        </div>
      </section>

      {/* Drie rustige, editoriale kaarten */}
      <section className="ff-section bg-white">
        <div className="ff-container">
          <ol className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <li className="ff-card">
              <div className="ff-card__inner">
                <span className="ff-badge">Stap 1</span>
                <h2 className="ff-h3 mt-3">Beantwoord de stijlvragen</h2>
                <p className="ff-body text-[var(--color-muted)] mt-2">
                  Kies wat je aanspreekt—silhouet, materiaal, kleurtemperatuur en
                  gelegenheid. Wij lezen de patronen, niet je postcode.
                </p>
              </div>
            </li>
            <li className="ff-card">
              <div className="ff-card__inner">
                <span className="ff-badge">Stap 2</span>
                <h2 className="ff-h3 mt-3">Ontvang je AI Style Report</h2>
                <p className="ff-body text-[var(--color-muted)] mt-2">
                  Je persoonlijke stijl­samenvatting met uitleg waarom dit past
                  (silhouet, materiaal, kleurtemperatuur, archetype, seizoen).
                </p>
              </div>
            </li>
            <li className="ff-card">
              <div className="ff-card__inner">
                <span className="ff-badge">Stap 3</span>
                <h2 className="ff-h3 mt-3">Shop de look — of sla op</h2>
                <p className="ff-body text-[var(--color-muted)] mt-2">
                  Direct klikbare items per outfit. Opslaan voor later of delen
                  met je stylist/vrienden.
                </p>
              </div>
            </li>
          </ol>

          {/* CTA-rail onderaan, rustig en duidelijk */}
          <div className="ff-rail mt-10">
            <div className="ff-rail__left">
              <p className="ff-body text-[var(--color-muted)]">
                100% gratis · klaar in 2 min · privacy-vriendelijk
              </p>
            </div>
            <div className="ff-rail__right">
              <a
                href="/onboarding"
                className="btn btn-cta"
                aria-label="Start gratis: begin met je stijlquiz"
              >
                Start gratis
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HowItWorksPage;