import React from "react";
import { ArrowRight, ShieldCheck } from "lucide-react";

const DynamicOnboardingPage: React.FC = () => {
  return (
    <main className="bg-[color:var(--color-bg)] text-[color:var(--color-text)]">
      <section
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24"
        aria-labelledby="onb-title"
      >
        <header className="mb-8">
          <h1
            id="onb-title"
            className="font-heading text-[clamp(2rem,5vw,2.75rem)] leading-tight tracking-[-0.02em]"
          >
            We leren je stijl in 2 minuten kennen
          </h1>
          <p className="mt-3 text-[color:var(--color-muted)]">
            Antwoord kort op een aantal slimme vragen. Vervolgens krijg je je
            AI-style report en de eerste outfits.
          </p>
        </header>

        <div className="card">
          <div className="card-inner">
            <ol className="space-y-3 text-sm text-[color:var(--color-muted)]">
              <li>• Kleurtemperatuur & silhouet</li>
              <li>• Stijldoelen (werk, weekend, diner)</li>
              <li>• Materiaalvoorkeur en comfort</li>
            </ol>

            <div className="mt-6 flex flex-wrap gap-2">
              <span className="chip">
                <ShieldCheck className="w-4 h-4" />
                <span>Privacy: lokaal profiel</span>
              </span>
              <span className="chip">Afbreken kan altijd</span>
            </div>

            <div className="mt-8">
              <a href="/quiz" className="btn btn-primary" aria-label="Start quiz">
                Start quiz
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>

        <p className="text-xs text-[color:var(--color-muted)] mt-6">
          Tip: je kunt later altijd terug naar je antwoorden en ze finetunen.
        </p>
      </section>
    </main>
  );
};

export default DynamicOnboardingPage;