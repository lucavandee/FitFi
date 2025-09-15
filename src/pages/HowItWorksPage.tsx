import React from "react";
import { CheckCircle, Sparkles, ArrowRight } from "lucide-react";

const HowItWorksPage: React.FC = () => {
  return (
    <main
      className="bg-[color:var(--color-bg)] text-[color:var(--color-text)]"
      aria-labelledby="howitworks-title"
    >
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <header className="max-w-3xl">
          <div className="inline-flex items-center gap-2 text-sm text-[color:var(--color-muted)] mb-3">
            <Sparkles className="w-4 h-4" aria-hidden="true" />
            <span>Zo werkt FitFi</span>
          </div>
          <h1
            id="howitworks-title"
            className="font-heading text-[clamp(2rem,5vw,3rem)] leading-tight tracking-[-0.02em]"
          >
            Van test naar outfits — in 3 heldere stappen
          </h1>
          <p className="mt-4 text-[color:var(--color-muted)]">
            Onze AI vertaalt jouw voorkeuren en persoonlijkheid naar outfits die
            passen bij silhouet, seizoen en gelegenheid — zonder ruis.
          </p>
        </header>

        <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* 1 */}
          <li className="card">
            <div className="card-inner">
              <span className="step-badge" aria-hidden="true">
                1
              </span>
              <h2 className="card-title">Korte stijl- & persoonlijkheidstest</h2>
              <p className="card-text">
                Beantwoord enkele slimme vragen (± 2 minuten). Geen gedoe,
                maximaal signaal.
              </p>
              <ul className="mt-4 space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[color:var(--color-success)]" />
                  <span>Gefocuste vragen, direct relevant</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[color:var(--color-success)]" />
                  <span>Geen opsmuk, duidelijke keuzes</span>
                </li>
              </ul>
            </div>
          </li>

          {/* 2 */}
          <li className="card">
            <div className="card-inner">
              <span className="step-badge" aria-hidden="true">
                2
              </span>
              <h2 className="card-title">AI-profiel en stijlrichtingen</h2>
              <p className="card-text">
                Je krijgt een stijlprofiel met archetypen en kleurtemperatuur +
                do's & don'ts.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="chip">Slim minimal</span>
                <span className="chip">Italiaans smart casual</span>
                <span className="chip">Weekend relaxed</span>
              </div>
            </div>
          </li>

          {/* 3 */}
          <li className="card">
            <div className="card-inner">
              <span className="step-badge" aria-hidden="true">
                3
              </span>
              <h2 className="card-title">Outfits + uitleg (waarom dit past)</h2>
              <p className="card-text">
                Per outfit krijg je een korte uitleg: silhouet, materialen en
                kleur — zodat je snapt waarom het werkt.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="chip chip-accent">Seizoen-ready</span>
                <span className="chip">NL-merken</span>
                <span className="chip">Direct shopbaar*</span>
              </div>
              <p className="text-xs text-[color:var(--color-muted)] mt-2">
                *Shop-links volgen zodra partners actief zijn.
              </p>
            </div>
          </li>
        </ol>

        <div className="mt-12 flex flex-wrap items-center gap-3">
          <a
            href="/dynamic-onboarding"
            className="btn btn-primary"
            aria-label="Start meteen"
          >
            Start gratis • 2 minuten
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </a>
          <a
            href="/prijzen"
            className="btn btn-ghost"
            aria-label="Bekijk prijzen"
          >
            Bekijk prijzen
          </a>
        </div>
      </section>
    </main>
  );
};

export default HowItWorksPage;