// src/pages/ResultsPage.tsx
import React from "react";
import { CheckCircle, ArrowRight } from "lucide-react";
import SwipeCarousel from "@/components/ui/SwipeCarousel";

type Outfit = {
  title: string;
  summary: string;
  why: string;
  // img?: string; // indien later visuals worden toegevoegd
};

const outfits: Outfit[] = [
  {
    title: "Smart casual — Italiaans",
    summary: "Taupe knit • rechte pantalon • witte sneaker.",
    why: "Warme taupe werkt met je (warm-neutrale) huidtint; het rechte silhouet verlengt en oogt minimal chic.",
  },
  {
    title: "Weekend relaxed",
    summary: "Heavy tee • denim overshirt • suède sneaker.",
    why: "Structuur in denim + suède geeft diepte; kleuren blijven kalm binnen je warme neutraal.",
  },
  {
    title: "Werk — clean minimal",
    summary: "Gebreide polo • wolmix pantalon • subtiele loafer.",
    why: "V-vorm bovenlichaam krijgt balans; materialen vallen strak zonder te trekken.",
  },
  {
    title: "Diner — ton-sur-ton",
    summary: "Merinowol crewneck • donker-taupe chino • leren sneaker.",
    why: "Ton-sur-ton vergroot lengte-effect; merino houdt de look verfijnd en licht.",
  },
];

const ResultsPage: React.FC = () => {
  return (
    <main className="bg-[color:var(--color-bg)] text-[color:var(--color-text)]">
      <section className="section" aria-labelledby="results-title">
        <div className="container">
          <header className="max-w-3xl">
            <h1 id="results-title" className="hero__title text-[clamp(2rem,5vw,2.75rem)]">
              Jouw AI-style resultaten
            </h1>
            <p className="lead mt-3">
              Hieronder zie je je profiel en de eerste outfits. Per kaart leggen we kort uit
              <em> waarom</em> dit bij je past.
            </p>
          </header>

          {/* Profiel in 't kort */}
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            <section className="card lg:col-span-1" aria-labelledby="profile">
              <div className="card__inner">
                <h2 id="profile" className="card__title">Profiel in 't kort</h2>
                <ul className="mt-3 space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[color:var(--color-success)]" />
                    <span>Silhouet: recht / slank</span>
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

            {/* Outfits swipe-carousel */}
            <section className="lg:col-span-2" aria-labelledby="outfits">
              <div className="flex items-center justify-between mb-2">
                <h2 id="outfits" className="card__title">Eerste outfits</h2>
                <a href="/feed" className="btn btn-ghost" aria-label="Bekijk meer outfits">Meer</a>
              </div>

              <SwipeCarousel ariaLabel="Outfit carrousel">
                {outfits.map((o) => (
                  <article key={o.title} className="subcard">
                    {/* Visual skeleton (vervang later door SmartImage) */}
                    <div className="skel" style={{ aspectRatio: "4 / 5" }} aria-hidden="true" />
                    <div className="subcard__inner">
                      <h3 className="subcard__title">{o.title}</h3>
                      <p className="subcard__kicker">{o.summary}</p>
                      <p className="mt-3 text-sm">
                        <strong>Waarom dit werkt:</strong> {o.why}
                      </p>
                    </div>
                  </article>
                ))}
              </SwipeCarousel>

              <div className="mt-6 flex flex-wrap gap-3">
                <a href="/feed" className="btn btn-primary" aria-label="Bekijk meer outfits">
                  Bekijk meer outfits
                </a>
                <a href="/dynamic-onboarding" className="btn btn-ghost" aria-label="Fijnslijpen voorkeuren">
                  Fijnslijpen voorkeuren
                </a>
              </div>
            </section>
          </div>
        </div>
      </section>

      {/* Sticky mobile CTA */}
      <div className="sticky-cta md:hidden" role="region" aria-label="Snelle actie">
        <div className="sticky-cta__inner">
          <div className="sticky-cta__text">
            <strong>Upgrade naar Pro</strong>
            <span className="muted"> 10+ outfits met uitleg, seizoensupdates</span>
          </div>
          <a href="/prijzen" className="btn btn-primary" aria-label="Ga naar prijzen">
            Bekijk plannen <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </main>
  );
};

export default ResultsPage;