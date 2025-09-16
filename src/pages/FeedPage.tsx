import React from "react";
import { CheckCircle, ArrowRight } from "lucide-react";
import ErrorBoundary from "@/components/ErrorBoundary";
import SwipeCarousel from "@/components/ui/SwipeCarousel";

type Card = {
  title: string;
  body: string;
  why: string;
  tags: string[];
};

const cards: Card[] = [
  {
    title: "Smart casual — Italiaans",
    body: "Taupe knit • rechte pantalon • witte sneaker.",
    why: "Warme taupe werkt met warm-neutrale huid; rechte lijn verlengt en oogt minimal chic.",
    tags: ["Seizoen", "Werk"],
  },
  {
    title: "Weekend relaxed",
    body: "Heavy tee • denim overshirt • suède sneaker.",
    why: "Structuur in denim + suède geeft diepte; kleuren blijven rustig.",
    tags: ["Weekend", "Comfort"],
  },
  {
    title: "Werk — clean minimal",
    body: "Gebreide polo • wolmix pantalon • subtiele loafer.",
    why: "V-vorm in bovenlichaam balanceert; materialen vallen strak.",
    tags: ["Werk", "Minimal"],
  },
  {
    title: "Diner — ton-sur-ton",
    body: "Merino crewneck • donker-taupe chino • leren sneaker.",
    why: "Ton-sur-ton vergroot lengte-effect; merino oogt verfijnd.",
    tags: ["Diner", "Ton-sur-ton"],
  },
  {
    title: "Smart denim",
    body: "Indigo denim • crisp oxford • suède desert boot.",
    why: "Indigo contrasteert subtiel; suède voegt luxe textuur toe.",
    tags: ["Denim", "Smart"],
  },
  {
    title: "Rain-ready commute",
    body: "Tech trench • tapered chino • waterdichte sneaker.",
    why: "Tech shell houdt proporties strak; functioneel zonder bulk.",
    tags: ["Reizen", "Weer"],
  },
];

const FeedPage: React.FC = () => {
  return (
    <ErrorBoundary>
      <main className="bg-[color:var(--color-bg)] text-[color:var(--color-text)]">
        <section className="section" aria-labelledby="feed-title">
          <div className="container">
            <header className="flex items-end justify-between gap-4">
              <div>
                <h1 id="feed-title" className="hero__title text-[clamp(2rem,5vw,2.6rem)]">
                  Outfit feed
                </h1>
                <p className="lead mt-3">Swipe door recente outfit-ideeën met korte uitleg waarom ze werken.</p>
              </div>
              <a href="/dynamic-onboarding" className="btn btn-ghost hidden md:inline-flex" aria-label="Start gratis">
                Start gratis
                <ArrowRight className="w-4 h-4" />
              </a>
            </header>

            {/* Swipe feed */}
            <div className="mt-8">
              <SwipeCarousel ariaLabel="Outfit feed carrousel">
                {cards.map((c) => (
                  <article key={c.title} className="subcard interactive-elevate">
                    <div className="skel" style={{ aspectRatio: "4/5" }} aria-hidden="true" />
                    <div className="subcard__inner">
                      <h2 className="subcard__title">{c.title}</h2>
                      <p className="subcard__kicker">{c.body}</p>
                      <p className="mt-3 text-sm">
                        <strong>Waarom dit werkt:</strong> {c.why}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {c.tags.map((t) => (
                          <span key={t} className="chip">{t}</span>
                        ))}
                      </div>
                      <div className="mt-4 flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-[color:var(--color-success)]" />
                        <span>Seizoen-ready</span>
                      </div>
                    </div>
                  </article>
                ))}
              </SwipeCarousel>
            </div>

            <div className="mt-8 flex justify-center">
              <a href="/prijzen" className="btn btn-primary" aria-label="Bekijk plannen">
                Bekijk plannen
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>

        {/* Sticky CTA mobiel */}
        <div className="sticky-cta md:hidden" role="region" aria-label="Snelle actie">
          <div className="sticky-cta__inner">
            <div className="sticky-cta__text">
              <strong>Meer outfits?</strong>
              <span className="muted"> Upgrade naar Pro</span>
            </div>
            <a href="/prijzen" className="btn btn-primary" aria-label="Ga naar prijzen">
              Bekijk plannen
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </main>
    </ErrorBoundary>
  );
};

export default FeedPage;