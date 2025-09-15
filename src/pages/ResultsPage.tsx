// src/pages/ResultsPage.tsx
import React from "react";
import { CheckCircle } from "lucide-react";

const ResultsPage: React.FC = () => {
  return (
    <main className="bg-[color:var(--color-bg)] text-[color:var(--color-text)]">
      <section
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24"
        aria-labelledby="results-title"
      >
        <header className="max-w-3xl">
          <h1
            id="results-title"
            className="font-heading text-[clamp(2rem,5vw,2.75rem)] leading-tight tracking-[-0.02em]"
          >
            Jouw AI-style resultaten
          </h1>
          <p className="mt-3 text-[color:var(--color-muted)]">
            Hieronder zie je je stijlprofiel en eerste outfit-richtingen. Per
            kaart leggen we kort uit waarom dit bij je past.
          </p>
        </header>

        {/* Profiel */}
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <section className="card lg:col-span-1" aria-labelledby="profile">
            <div className="card-inner">
              <h2 id="profile" className="card-title">
                Profiel in 't kort
              </h2>
              <ul className="mt-3 space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[color:var(--color-success)]" />
                  <span>Silhouet: recht/slank</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[color:var(--color-success)]" />
                  <span>Kleurtemperatuur: warm-neutraal</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[color:var(--color-success)]" />
                  <span>Archetypen: smart minimal • Italiaans casual</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Outfits — toon 2 voorbeeldkaarten, uitleg waarom dit past */}
          <section className="card lg:col-span-2" aria-labelledby="outfits">
            <div className="card-inner">
              <h2 id="outfits" className="card-title">
                Eerste outfits
              </h2>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <article className="subcard" aria-labelledby="o1">
                  <div className="subcard-inner">
                    <h3 id="o1" className="subcard-title">
                      Smart casual — Italiaans
                    </h3>
                    <p className="subcard-text">
                      Taupe knit + rechte pantalon + witte sneaker.
                    </p>
                    <p className="why">
                      <strong>Waarom dit werkt:</strong> de warme taupe kleurt
                      goed bij je huidtint; het rechte silhouet verlengt en
                      blijft minimal chic.
                    </p>
                  </div>
                </article>

                <article className="subcard" aria-labelledby="o2">
                  <div className="subcard-inner">
                    <h3 id="o2" className="subcard-title">
                      Weekend relaxed
                    </h3>
                    <p className="subcard-text">
                      Heavy tee + denim overshirt + suède sneaker.
                    </p>
                    <p className="why">
                      <strong>Waarom dit werkt:</strong> structuur in denim +
                      suède geeft diepte; kleuren blijven binnen je warme
                      neutraal, dus rustig en volwassen.
                    </p>
                  </div>
                </article>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <a href="/feed" className="btn btn-primary" aria-label="Bekijk meer outfits">
                  Bekijk meer outfits
                </a>
                <a href="/dynamic-onboarding" className="btn btn-ghost">
                  Fijnslijpen voorkeuren
                </a>
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
};

export default ResultsPage;