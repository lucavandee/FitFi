import React from "react";
import { Helmet } from 'react-helmet-async';
import ResultsHeader from '@/components/results/ResultsHeader';

/**
 * EnhancedResultsPage
 * - Syntactisch sluitende JSX (geen zwerftags of dubbele haakjes)
 * - Geen extra imports nodig (dus geen kans op import-resolutie errors)
 * - Classes afgestemd op de eerder aangeleverde polish (.res-hero, .chips, .res-grid, .res-card, etc.)
 * - Vult de grid met drie voorbeeldkaarten als er (nog) geen data is
 */

type CardItem = {
  id: string;
  title: string;
  bullets: string[];
  // voor nu placeholder tiles; vervang door echte urls wanneer beschikbaar
  tiles: string[];
};

const fallbackCardItems: CardItem[] = [
  {
    id: "smart-casual",
    title: "Smart casual (dagelijks)",
    bullets: [
      "Netter denim — rechte pijp",
      "Witte sneaker — minimal",
      "Licht overshirt — koele tint",
    ],
    tiles: ["", "", "", ""],
  },
  {
    id: "mono-workday",
    title: "Monochrome workday",
    bullets: [
      "Fijngebreide crew — off-white",
      "Wolmix pantalon — rechte pijp",
      "Leren loafer — clean buckle",
    ],
    tiles: ["", "", "", ""],
  },
  {
    id: "athflow-weekend",
    title: "Athflow weekend",
    bullets: ["Merino zip hoodie", "Tech jogger", "Minimal runner"],
    tiles: ["", "", "", ""],
  },
];

const EnhancedResultsPage: React.FC = () => {
  const cards = fallbackCardItems;
    <>
  return (
    <>
      <Helmet>
        <title>Jouw Stijlanalyse Resultaten - FashionFinder</title>
        <meta name="description" content="Ontdek jouw persoonlijke stijl en shop de perfecte outfits die bij je passen." />
      </Helmet>
      <div className="min-h-screen bg-gray-50">
    <main className="ff-results">
      {/* 1) Hero / intro */}
      <section className="res-hero">
        <p className="eyebrow">Onze aanbeveling</p>
        <h1 className="res-hero__title">
          Dit past bij jouw stijl — <span>clean, smart-casual</span>
        </h1>
        <p className="res-hero__sub">
          We kozen voor een cleane, smart-casual look: netter denim, witte
          sneaker en licht overshirt — minimalistisch en comfortabel.
        </p>

        <div className="res-hero__cta">
          <a className="btn btn--primary" href="#shop">
            Shop deze look
          </a>
          <a className="btn btn--ghost" href="/onboarding">
            Nieuwe analyse
          </a>
        </div>

        <ul className="chips" aria-label="USP's">
          <li className="chip chip--active">100% gratis</li>
          <li className="chip">Klaar in 2 min</li>
          <li className="chip">Outfits + shoplinks</li>
          <li className="chip">Privacy-first</li>
        </ul>
      </section>

      {/* 2) Grid met kaarten */}
      <section className="res-grid" aria-labelledby="outfits-heading" data-cv="auto">
        <h2 id="outfits-heading" className="sr-only">
          Aanbevolen outfits
        </h2>

        {cards.map((card) => (
          <article key={card.id} className="res-card" data-style={card.id}>
            {/* Mozaïek: 2×2 tegels. Als je echte images hebt, vervang <div className="res-img" /> door jouw <img />/SmartImage. */}
            <div className="res-card__mosaic">
              {card.tiles.map((_, idx) => (
                <div key={idx} className="res-card__tile" />
              ))}
            </div>

            <div className="res-card__body">
              <h3 className="res-card__title">{card.title}</h3>
              <ul className="res-card__bullets">
                {card.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
              <a className="link-cta" href="#shop">
                Shop vergelijkbare items
              </a>
            </div>
          </article>
        ))}
      </section>

      {/* 3) (optioneel) Premium strip kan hieronder; laat ik nu weg om import-conflicten te voorkomen */}
      {/* <PremiumUpsellStrip /> */}
    </>
      </div>
    </>
  );
};

export default EnhancedResultsPage;