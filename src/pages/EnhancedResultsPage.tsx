// src/pages/EnhancedResultsPage.tsx
import React from "react";
import { NavLink } from "react-router-dom";
import ExplainBadge from "@/components/outfits/ExplainBadge";
import StickyCTA from "@/components/outfits/StickyCTA";

/**
 * EnhancedResultsPage — premium UI zonder data-architectuur te wijzigen.
 * - Als er geen externe data/hook aanwezig is, tonen we een lichte DEMO (UI-only).
 * - Tokens-first, geen hex. Skeletons voor afbeeldingen. Explainability-badges.
 * - Mobiele sticky CTA om door te klikken (shop of bewaar).
 */

// Type kan aansluiten op jullie bestaande shape; hier simpel gehouden.
type Outfit = {
  id: string;
  title: string;
  match: number;   // 0..100
  why: string;     // korte uitleg
  tags: string[];  // explainability labels
};

const DEMO: Outfit[] = [
  {
    id: "r1",
    title: "Smart Casual — Italiaans",
    match: 93,
    why: "Zachte taupe top met rechte pantalon verlengt je silhouet; wit sneakerdetail houdt het minimal-chic.",
    tags: ["Kleurharmonie", "Silhouet", "Materiaal"],
  },
  {
    id: "r2",
    title: "Street Minimal — Monochrome",
    match: 89,
    why: "Monochrome laagjes in matten stoffen geven rust en diepte zonder drukke prints.",
    tags: ["Monochroom", "Textuur", "Balans"],
  },
  {
    id: "r3",
    title: "Business Relaxed — Soft Neutrals",
    match: 86,
    why: "Wolblend blazer verzacht schouders; rechte broeklijn en subtiele sneakers houden het modern.",
    tags: ["Silhouet", "Materiaal", "Contrast"],
  },
];

export default function EnhancedResultsPage() {
  // TODO data-hook integratie blijft ongemoeid; val desnoods terug op DEMO
  const outfits = DEMO;

  return (
    <main id="main" className="bg-surface text-text">
      {/* Header */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <h1 className="font-heading text-2xl sm:text-3xl ff-text-balance">
          Jouw AI Style Report
        </h1>
        <p className="mt-2 text-text/80">
          Dit zijn je beste matches op basis van je voorkeuren. Bij elke look zie je kort <em>waarom</em> dit voor jou werkt.
        </p>
      </section>

      {/* Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-24 md:pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {outfits.map((o) => (
            <article key={o.id} className="ff-card ff-hover-lift overflow-hidden">
              {/* Afbeelding — skeleton placeholder; vervang met echte afbeelding als beschikbaar */}
              <div className="aspect-[4/5] ff-skeleton" aria-hidden="true" />

              <div className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-heading text-lg leading-tight">{o.title}</h2>
                  <span
                    className="ff-chip text-xs"
                    aria-label={`Match ${o.match} procent`}
                    title={`${o.match}% match`}
                  >
                    {o.match}% match
                  </span>
                </div>

                {/* Explainability badges */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {o.tags.map((t) => (
                    <ExplainBadge key={t}>{t}</ExplainBadge>
                  ))}
                </div>

                {/* Waarom dit werkt */}
                <p className="mt-3 text-sm text-text/80">{o.why}</p>

                {/* CTA's per kaart */}
                <div className="mt-4 flex items-center gap-2">
                  <NavLink to="/preview" className="ff-btn ff-btn-secondary h-9">
                    Bewaar
                  </NavLink>
                  <NavLink to="/start" className="ff-btn ff-btn-primary h-9">
                    Shop links
                  </NavLink>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Mobiele sticky CTA (alleen <= md) */}
      <StickyCTA primaryTo="/start" primaryLabel="Shop links" secondaryTo="/preview" secondaryLabel="Bewaar" />
    </main>
  );
}