import React from "react";
import { NavLink } from "react-router-dom";
import PageHero from "@/components/marketing/PageHero";

type Feature = { title: string; body: string; };
const FEATURES: Feature[] = [
  {
    title: "AI-analyse die wél klopt",
    body: "Geen vage termen. We vertalen jouw voorkeuren naar duidelijke richtlijnen voor silhouet, kleur en materiaal."
  },
  {
    title: "Outfits zonder ruis",
    body: "Per gelegenheid – werk, weekend, diner – zodat je sneller kiest en minder twijfelt."
  },
  {
    title: "Wishlist en prijsalerts",
    body: "Bewaar favorieten en laat je waarschuwen als iets in de aanbieding is. Jij houdt de regie."
  },
  {
    title: "Privacy-first",
    body: "We vragen weinig en doen er netjes mee. Geen doorverkoop. Geen onnodige tracking."
  }
];

export default function HomePage() {
  return (
    <main id="main" className="bg-[var(--color-bg)] text-[var(--color-text)]">
      <PageHero
        id="page-home"
        eyebrow="GRATIS AI STYLE REPORT"
        title="Ontdek wat jouw stijl over je zegt"
        subtitle="Beantwoord 6 korte vragen en krijg direct outfits en heldere uitleg. Rust in je keuzes, zonder ruis."
        align="left"
        as="h1"
        size="lg"
        ctas={[
          { label: "Start gratis", to: "/results", variant: "primary", "data-event": "cta_home_start" },
          { label: "Bekijk voorbeeld", to: "#preview", variant: "secondary", "data-event": "cta_home_preview" }
        ]}
        note="Klaar in ±2 minuten. Opzeggen kan altijd."
      />

      {/* Features-overzicht */}
      <section className="ff-container py-12">
        <h2 className="font-montserrat text-2xl text-[var(--color-text)] mb-6">Waarom FitFi werkt</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {FEATURES.map((f, i) => (
            <article
              key={i}
              className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)]"
            >
              <h3 className="font-montserrat text-lg text-[var(--color-text)]">{f.title}</h3>
              <p className="mt-2 text-[var(--color-text)]/80">{f.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Preview-kader (afbeelding kan later ingevuld worden) */}
      <section id="preview" className="ff-container py-12">
        <div className="grid gap-6 lg:grid-cols-2 items-center">
          <div>
            <h2 className="font-montserrat text-2xl text-[var(--color-text)]">Zo ziet je stijlrapport eruit</h2>
            <p className="mt-3 text-[var(--color-text)]/80">
              Je krijgt een helder profiel met kleuren die je laten stralen, vormen die kloppen en outfits die je direct kunt dragen.
              Alles rustig uitgelegd, zonder poeha.
            </p>
            <div className="mt-6 flex gap-3">
              <NavLink to="/results" className="ff-btn ff-btn-primary">Maak mijn rapport</NavLink>
              <NavLink to="/hoe-het-werkt" className="ff-btn ff-btn-secondary">Hoe het werkt</NavLink>
            </div>
          </div>
          <figure
            aria-label="Voorbeeld van resultaten"
            className="aspect-[16/10] w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-soft)] overflow-hidden grid place-items-center"
          >
            <div className="text-[var(--color-text)]/50 text-sm">
              Voorbeeldafbeelding komt hier
            </div>
          </figure>
        </div>
      </section>
    </main>
  );
}