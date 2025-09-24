// src/pages/HowItWorksPage.tsx
import React from "react";
import { NavLink } from "react-router-dom";
import StepCard from "@/components/how/StepCard";
import TestimonialCard from "@/components/how/TestimonialCard";

/**
 * HowItWorksPage — tokens-first, ff-utilities
 * - Heldere 3-stappenflow
 * - Wat je krijgt + micro-proof via testimonials
 * - CTA-strip (primary/secondary) conform regels
 */

const STEPS = [
  {
    title: "Beantwoord 6 korte vragen",
    description: "Smaak, pasvorm en kleurvoorkeur. Klaar in ±2 minuten.",
  },
  {
    title: "Bekijk jouw outfits",
    description: "Per gelegenheid: werk, weekend, diner. Zonder ruis.",
  },
  {
    title: "Shop bewust",
    description: "Optioneel: wishlist & prijsalerts — jij houdt de regie.",
  },
] as const;

const BENEFITS = [
  "Persoonlijk stijlprofiel—geen generieke adviezen",
  "Outfits per gelegenheid (werk, weekend, diner)",
  "Wishlist & prijsalerts (optioneel)",
  "Kleur- & silhouetlogica uitgelegd in Jip-en-Janneke",
] as const;

export default function HowItWorksPage() {
  return (
    <main id="main" className="ff-container ff-stack-lg bg-surface text-text">
      <section aria-labelledby="how-title" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <header className="mb-6 sm:mb-8">
          <p className="text-sm text-text/70">Snel. Persoonlijk. Nuchter.</p>
          <h1 id="how-title" className="font-heading text-2xl sm:text-3xl ff-text-balance">
            Hoe FitFi werkt
          </h1>
          <p className="mt-2 text-text/80">
            Wij vertalen jouw smaak naar outfits die kloppen—van kleur tot pasvorm. Geen ruis, alleen wat bij je past.
          </p>
        </header>

        {/* 3-steps */}
        <ol className="ff-steps" aria-label="Stappen">
          {STEPS.map((s, i) => (
            <li key={s.title}>
              <StepCard index={i + 1} title={s.title} description={s.description} />
            </li>
          ))}
        </ol>

        {/* CTA-strip */}
        <div className="mt-8 cta-row">
          <NavLink to="/quiz" className="ff-btn ff-btn-primary">Start gratis</NavLink>
          <NavLink to="/prijzen" className="ff-btn ff-btn-secondary">Bekijk prijzen</NavLink>
        </div>
      </section>

      {/* Benefit bullets + proof */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="font-heading text-xl sm:text-2xl">Wat je krijgt</h2>
        <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {BENEFITS.map((b) => (
            <li key={b}>
              <span className="ff-chip text-sm">✓ {b}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Proof */}
      <section aria-labelledby="proof-title" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8 sm:mt-10">
        <h2 id="proof-title" className="font-heading text-xl sm:text-2xl">Waarom mensen blij zijn</h2>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <TestimonialCard
            quote="Eindelijk rust in m'n kast — outfits waar ik me goed in voel."
            author="Eva (34)"
          />
          <TestimonialCard
            quote="Toegankelijk, duidelijk en geen verkooppraat. Houd ik van."
            author="Jasper (41)"
          />
          <TestimonialCard
            quote="Mijn werkoutfits voelen nu 'af'. Blij met de combinaties."
            author="Mila (29)"
          />
        </div>
      </section>
    </main>
  );
}