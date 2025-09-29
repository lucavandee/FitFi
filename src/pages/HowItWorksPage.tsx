import React from "react";
import { NavLink } from "react-router-dom";
import PageHero from "@/components/marketing/PageHero";
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
      <PageHero
        id="page-how"
        eyebrow="GRATIS AI STYLE REPORT"
        title="Hoe FitFi werkt"
        subtitle="Beantwoord 6 korte vragen en ontvang direct outfits die bij jouw leven passen — privacy-first, zonder ruis."
        align="left"
        as="h1"
        size="lg"
      />

      <section className="ff-container ff-steps-grid py-10 sm:py-12">
        {STEPS.map((s, i) => <StepCard key={i} title={s.title} description={s.description} index={i+1} />)}
      </section>

      <section className="ff-container py-8">
        <ul className="grid gap-3 md:grid-cols-2">
          {BENEFITS.map((b, i) => (
            <li key={i} className="ff-benefit">{b}</li>
          ))}
        </ul>
      </section>

      <section className="ff-container py-8">
        <div className="cta-row">
          <NavLink to="/results" className="ff-btn ff-btn-primary">Start gratis</NavLink>
          <NavLink to="/prijzen" className="ff-btn ff-btn-secondary">Bekijk prijzen</NavLink>
        </div>
      </section>

      <section className="ff-container py-12">
        <h2 className="font-heading text-xl sm:text-2xl mb-4">Ervaringen</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[1,2,3].map((n) => <TestimonialCard key={n} index={n} />)}
        </div>
      </section>
    </main>
  );
}