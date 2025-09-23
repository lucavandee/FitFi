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
    description:
      "Vertel ons over je voorkeuren (pasvorm, kleuren, gelegenheid). Geen gedoe—klaar in 2 minuten.",
  },
  {
    title: "AI analyseert je stijlprofiel",
    description:
      "We koppelen je antwoorden aan silhouettes, kleurharmonie en materiaalkeuze. Privacy-first, lokaal waar mogelijk.",
  },
  {
    title: "Ontvang outfits + shoplinks",
    description:
      "Bekijk complete looks, waarom het werkt voor jou en klik door naar betrouwbare shops met actuele prijzen.",
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
    <main id="main" className="bg-surface text-text">
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
        <ol className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6" aria-label="Stappen">
          {STEPS.map((s, i) => (
            <li key={s.title}>
              <StepCard index={i + 1} title={s.title} description={s.description} />
            </li>
          ))}
        </ol>

        {/* Benefits */}
        <section aria-labelledby="benefits-title" className="mt-8 sm:mt-10">
          <h2 id="benefits-title" className="font-heading text-xl sm:text-2xl">Wat je krijgt</h2>
          <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {BENEFITS.map((b) => (
              <li key={b}>
                <span className="ff-chip text-sm">✓ {b}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Proof */}
        <section aria-labelledby="proof-title" className="mt-8 sm:mt-10">
          <h2 id="proof-title" className="font-heading text-xl sm:text-2xl">Waarom mensen blij zijn</h2>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <TestimonialCard
              quote="Eindelijk outfits die ik zó kan aantrekken. Het voelt alsof iemand me echt snapt."
              author="Sanne"
              role="Creative producer"
            />
            <TestimonialCard
              quote="Geen eindeloos scrollen meer. In vijf minuten had ik drie looks en direct de goede maten."
              author="Jeroen"
              role="Product manager"
            />
            <TestimonialCard
              quote="De uitleg waarom iets werkt is top. Nu snap ik mijn silhouet en koop ik minder mis."
              author="Lotte"
              role="Consultant"
            />
          </div>
        </section>

        {/* CTA strip */}
        <section aria-labelledby="cta-title" className="mt-8 sm:mt-10 ff-glass p-4 sm:p-5">
          <h2 id="cta-title" className="sr-only">Aan de slag</h2>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="font-heading text-lg">Klaar voor jouw AI Style Report?</p>
              <p className="text-sm text-text/80">
                Start gratis—6 vragen, klaar in 2 minuten. Je krijgt direct outfits met uitleg en shoplinks.
              </p>
            </div>
            <div className="flex gap-2">
              <NavLink to="/start" className="ff-btn ff-btn-primary h-10">Start gratis</NavLink>
              <NavLink to="/pricing" className="ff-btn ff-btn-secondary h-10">Bekijk plannen</NavLink>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}