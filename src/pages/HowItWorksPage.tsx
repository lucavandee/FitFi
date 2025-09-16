import React from "react";
import { CheckCircle, Sparkles } from "lucide-react";
import Seo from "@/components/Seo";

const steps = [
  { t: "Korte stijltest", d: "Jouw voorkeuren, silhouet en context (werk, casual, avond)." },
  { t: "AI-analyse", d: "Archetype, kleurtemperatuur, materialen en proporties." },
  { t: "Outfits + uitleg", d: "Direct draagbaar, met 'waarom het werkt' en shopbare suggesties." },
];

const HowItWorksPage: React.FC = () => {
  return (
    <>
      <Seo
        title="Hoe het werkt — van test naar outfits"
        description="In 3 stappen naar je stijlrapport: test, AI-analyse en outfits met uitleg."
        canonical="https://www.fitfi.ai/hoe-het-werkt"
      />
      <main>
        <section className="section" aria-labelledby="howitworks-title">
          <div className="container max-w-5xl">
            <header className="max-w-3xl">
              <div className="inline-flex items-center gap-2 text-sm muted mb-3">
                <Sparkles className="w-4 h-4" aria-hidden="true" />
                <span>Zo werkt FitFi</span>
              </div>
              <h1 id="howitworks-title" className="hero__title">Van test naar outfits — in 3 stappen</h1>
              <p className="lead mt-3">
                Onze AI vertaalt jouw voorkeuren naar concrete outfits met uitleg, passend bij seizoen en gelegenheid.
              </p>
            </header>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {steps.map((s) => (
                <article key={s.t} className="card interactive-elevate">
                  <div className="card__inner">
                    <h3 className="card__title">{s.t}</h3>
                    <p className="mt-2">{s.d}</p>
                    <div className="mt-4 inline-flex items-center gap-2 text-sm muted">
                      <CheckCircle className="w-4 h-4 text-[color:var(--color-success)]" />
                      <span>Supereenvoudig</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-10 text-center">
              <a href="/registreren" className="btn btn-primary btn-lg">Start gratis</a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default HowItWorksPage;