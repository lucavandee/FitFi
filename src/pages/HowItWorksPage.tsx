import React from "react";
import { NavLink } from "react-router-dom";
import PageHero from "@/components/marketing/PageHero";

const STEPS = [
  { title: "Beantwoord 6 korte vragen", description: "Smaak, pasvorm en kleur. Klaar in ±2 minuten." },
  { title: "Bekijk jouw outfits", description: "Per gelegenheid: werk, weekend, diner. Zonder ruis." },
  { title: "Shop bewust", description: "Wishlist & prijsalerts (optioneel). Jij houdt de regie." }
] as const;

export default function HowItWorksPage() {
  return (
    <main id="main" className="bg-[var(--color-bg)] text-[var(--color-text)]">
      <PageHero
        id="page-how"
        eyebrow="GRATIS AI STYLE REPORT"
        title="Hoe FitFi werkt"
        subtitle="Beantwoord 6 korte vragen en ontvang direct outfits die bij jouw leven passen — privacy-first, zonder ruis."
        align="left"
        as="h1"
        size="lg"
        ctas={[
          { label: "Start gratis", to: "/results", variant: "primary", "data-event": "cta_how_start" },
          { label: "Bekijk prijzen", to: "/prijzen", variant: "secondary", "data-event": "cta_how_pricing" }
        ]}
        note="Geen spam. Opzeggen kan altijd."
      />

      <section className="ff-container py-10 sm:py-12">
        <div className="grid gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <article key={i} className="rounded-[var(--radius-lg)] border border-[var(--color-border)] p-6 bg-[var(--color-surface)] shadow-[var(--shadow-soft)]">
              <div className="text-[var(--color-text-muted)] text-sm mb-2">Stap {i + 1}</div>
              <h3 className="font-montserrat text-lg text-[var(--color-text)]">{s.title}</h3>
              <p className="text-[var(--color-text)]/80 mt-2">{s.description}</p>
            </article>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <NavLink to="/results" className="ff-btn ff-btn-primary">Start gratis</NavLink>
          <NavLink to="/veelgestelde-vragen" className="ff-btn ff-btn-secondary">FAQ</NavLink>
        </div>
      </section>
    </main>
  );
}