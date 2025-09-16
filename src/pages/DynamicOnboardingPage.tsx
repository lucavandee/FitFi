// src/pages/DynamicOnboardingPage.tsx
import React from "react";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

const DynamicOnboardingPage: React.FC = () => {
  const startQuiz = () => (window.location.href = "/quiz");

  return (
    <main className="bg-[color:var(--color-bg)] text-[color:var(--color-text)]">
      <section className="section" aria-labelledby="onb-title">
        <div className="container max-w-4xl">
          <header className="mb-8">
            <div className="inline-flex items-center gap-2 text-sm muted mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Start</span>
            </div>
            <h1 id="onb-title" className="hero__title text-[clamp(2rem,5vw,2.75rem)]">
              We leren je stijl in 2 minuten kennen
            </h1>
            <p className="lead mt-3">
              Antwoord kort op een paar slimme vragen. Vervolgens krijg je je AI-style report
              en de eerste outfits — met een korte uitleg per outfit.
            </p>
          </header>

          {/* Steps */}
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="card">
              <div className="card__inner">
                <span className="step-badge">1</span>
                <h2 className="card__title">Richting kiezen</h2>
                <p className="card__text">Welke stijlen trekken je? Kies globaal; finetunen kan later.</p>
              </div>
            </div>
            <div className="card">
              <div className="card__inner">
                <span className="step-badge">2</span>
                <h2 className="card__title">Silhouet & comfort</h2>
                <p className="card__text">Wat wil je benadrukken? Hoe wil je dat kleding valt?</p>
              </div>
            </div>
            <div className="card">
              <div className="card__inner">
                <span className="step-badge">3</span>
                <h2 className="card__title">Resultaten & outfits</h2>
                <p className="card__text">Je krijgt direct je profiel en eerste outfits met uitleg.</p>
              </div>
            </div>
          </div>

          {/* Trust / privacy */}
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="chip">
              <ShieldCheck className="w-4 h-4" />
              <span>Privacy-bewust</span>
            </span>
            <span className="chip">Stoppen kan altijd</span>
          </div>

          <div className="mt-8">
            <button onClick={startQuiz} className="btn btn-primary btn-lg" aria-label="Start quiz">
              Start quiz
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Sticky mobile CTA */}
      <div className="sticky-cta md:hidden" role="region" aria-label="Snelle actie">
        <div className="sticky-cta__inner">
          <div className="sticky-cta__text">
            <strong>Klaar? </strong>
            <span className="muted">2 minuten • gratis</span>
          </div>
          <button onClick={startQuiz} className="btn btn-primary" aria-label="Start quiz onderaan">
            Start quiz <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </main>
  );
};

export default DynamicOnboardingPage;