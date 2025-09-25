import React from "react";
import { NavLink } from "react-router-dom";
import StepCard from "@/components/how/StepCard";
import TestimonialCard from "@/components/how/TestimonialCard";

const STEPS = [
  { title: "Beantwoord 6 korte vragen", description: "Smaak, pasvorm en kleur. Klaar in ±2 minuten." },
  { title: "Bekijk jouw outfits", description: "Per gelegenheid: werk, weekend, diner. Zonder ruis." },
  { title: "Shop bewust", description: "Wishlist & prijsalerts (optioneel). Jij houdt de regie." }
] as const;

const BENEFITS = [
  "Persoonlijk stijlprofiel — geen generieke adviezen",
  "Outfits per gelegenheid (werk, weekend, diner)",
  "Wishlist & alerts",
  "Kleur- & silhouetlogica helder uitgelegd"
] as const;

export default function HowItWorksPage() {
  return (
    <main id="main" className="bg-bg text-text">
      <section className="ff-container ff-stack-lg py-10 sm:py-12">
        <header className="ff-stack">
          <p className="text-sm text-text/70">Snel. Persoonlijk. Nuchter.</p>
          <h1 className="font-heading text-2xl sm:text-3xl">Hoe FitFi werkt</h1>
          <p className="text-text/80">We vertalen jouw smaak naar outfits die kloppen — zonder ruis.</p>
          <div className="cta-row">
            <NavLink to="/quiz" className="ff-btn ff-btn-primary">Start gratis</NavLink>
            <NavLink to="/prijzen" className="ff-btn ff-btn-secondary">Bekijk prijzen</NavLink>
          </div>
        </header>

        <ol className="ff-steps" aria-label="Stappen">
          {STEPS.map((s, i) => (
            <li key={s.title}><StepCard index={i+1} title={s.title} description={s.description} /></li>
          ))}
        </ol>

        <h2 className="mt-8 font-heading text-xl sm:text-2xl">Wat je krijgt</h2>
        <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {BENEFITS.map((b) => <li key={b}><span className="ff-chip text-sm">✓ {b}</span></li>)}
        </ul>

        <h2 className="mt-10 font-heading text-xl sm:text-2xl">Waarom mensen blij zijn</h2>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <TestimonialCard quote="Eindelijk rust in m'n kast — outfits waar ik me goed in voel." author="Eva (34)" />
          <TestimonialCard quote="Toegankelijk, duidelijk en geen verkooppraat. Houd ik van." author="Jasper (41)" />
          <TestimonialCard quote="Werkoutfits voelen nu 'af'. Blij met de combinaties." author="Mila (29)" />
        </div>
      </section>
    </main>
  );
}