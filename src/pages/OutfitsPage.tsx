// src/pages/OutfitsPage.tsx
import React from "react";
import { NavLink } from "react-router-dom";
import PremiumChip from "@/components/ui/PremiumChip";

/**
 * OutfitsPage — tokens-first polish
 * - Doel: premium layout + a11y zonder functionele wijzigingen.
 * - We gebruiken opt-in `ff-` utilities en semantische tokens.
 * - Als je lokale/dynamische outfitdata hebt, render die in plaats van de DEMO-lijst.
 */

type DemoOutfit = {
  id: string;
  title: string;
  match: number; // 0..100
  note: string;
};

const DEMO_OUTFITS: DemoOutfit[] = [
  { id: "o1", title: "Smart Casual — Italiaans", match: 92, note: "Minimal-chic; warm taupe + clean wit." },
  { id: "o2", title: "Street Minimal — Monochrome", match: 88, note: "Zwart/steen; stacked textures, geen drukke prints." },
  { id: "o3", title: "Business Relaxed — Soft Neutrals", match: 85, note: "Wollig blazertje; rechte pantalon; subtiele sneakers." },
];

const FILTERS = ["Alle", "Smart Casual", "Minimal", "Street", "Business"] as const;
type Filter = typeof FILTERS[number];

export default function OutfitsPage() {
  const [filter, setFilter] = React.useState<Filter>("Alle");

  const outfits = React.useMemo(() => {
    if (filter === "Alle") return DEMO_OUTFITS;
    return DEMO_OUTFITS.filter((o) => o.title.toLowerCase().includes(filter.toLowerCase()));
  }, [filter]);

  return (
    <main id="main" className="bg-surface text-text">
      <section aria-labelledby="outfits-title" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <header className="mb-6 sm:mb-8">
          <p className="text-sm text-text/70">Jouw selectie</p>
          <h1 id="outfits-title" className="font-heading text-2xl sm:text-3xl ff-text-balance">
            Aanbevolen outfits
          </h1>
          <p className="mt-2 text-text/80">
            Op basis van jouw voorkeuren. Elke look komt met een korte uitleg en shop-CTA.
          </p>
        </header>

        <div aria-label="Filters" className="mb-5 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button key={f} type="button" onClick={() => setFilter(f)} className="focus:outline-none" aria-pressed={filter === f}>
              <PremiumChip active={filter === f}>{f}</PremiumChip>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {outfits.map((item) => (
            <article key={item.id} className="ff-card ff-hover-lift overflow-hidden">
              <div className="aspect-[4/5] ff-skeleton" aria-hidden="true" />
              <div className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-heading text-lg leading-tight">{item.title}</h2>
                  <span className="ff-chip text-xs" aria-label={`Match ${item.match} procent`} title={`${item.match}% match`}>
                    {item.match}% match
                  </span>
                </div>
                <p className="mt-2 text-sm text-text/80">{item.note}</p>
                <div className="mt-4 flex items-center gap-2">
                  <NavLink to="/hoe-het-werkt" className="ff-btn ff-btn-primary h-9">Bekijk details</NavLink>
                  <NavLink to="/prijzen" className="ff-btn ff-btn-secondary h-9">Shop links</NavLink>
                </div>
              </div>
            </article>
          ))}

          {outfits.length === 0 && (
            <div className="col-span-full">
              <div className="ff-card p-6 text-center">
                <p className="text-text/80">Geen outfits gevonden voor deze filter.</p>
                <div className="mt-3">
                  <button onClick={() => setFilter("Alle")} className="ff-btn ff-btn-secondary h-9">Reset filters</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}