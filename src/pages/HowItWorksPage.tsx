import React from "react";
import { NavLink } from "react-router-dom";
import { Sparkles } from "lucide-react";
import StepCard from "@/components/how/StepCard";
import TestimonialCard from "@/components/how/TestimonialCard";

const STEPS = [
  { 
    title: "Beantwoord 6 korte vragen", 
    description: "Smaak, pasvorm en kleur. Klaar in ±2 minuten." 
  },
  { 
    title: "Bekijk jouw outfits", 
    description: "Per gelegenheid: werk, weekend, diner. Zonder ruis." 
  },
  { 
    title: "Shop bewust", 
    description: "Wishlist & prijsalerts (optioneel). Jij houdt de regie." 
  }
];

const BENEFITS = [
  "Persoonlijk stijlprofiel — geen generieke adviezen",
  "Outfits per gelegenheid (werk, weekend, diner)",
  "Wishlist & alerts",
  "Kleur- & silhouetlogica helder uitgelegd"
];

const TESTIMONIALS = [
  {
    quote: "Eindelijk rust in m'n kast — outfits waar ik me goed in voel.",
    author: "Eva",
    role: "Marketing"
  },
  {
    quote: "Toegankelijk, duidelijk en geen verkooppraat. Houd ik van.",
    author: "Jasper",
    role: "Consultant"
  },
  {
    quote: "Werkoutfits voelen nu 'af'. Blij met de combinaties.",
    author: "Mila",
    role: "HR"
  }
];

export default function HowItWorksPage() {
  return (
    <main id="main" className="bg-bg text-text">
      <section className="ff-container ff-stack-lg py-12 sm:py-14">
        <header className="ff-stack">
          <p className="text-sm text-text/70">Snel. Persoonlijk. Nuchter.</p>
          <h1 className="font-heading text-2xl sm:text-3xl ff-text-balance">
            Hoe FitFi werkt
          </h1>
          <p className="text-text/80 max-w-2xl">
            We vertalen jouw smaak naar outfits die kloppen — zonder ruis.
          </p>
          <div className="cta-row">
            <NavLink to="/quiz" className="ff-btn ff-btn-primary">
              <Sparkles className="w-4 h-4" />
              <span className="ml-2">Start gratis</span>
            </NavLink>
            <NavLink to="/prijzen" className="ff-btn ff-btn-secondary">
              Bekijk prijzen
            </NavLink>
          </div>
        </header>

        <section aria-labelledby="steps-title">
          <h2 id="steps-title" className="sr-only">Stappen</h2>
          <ol className="ff-steps">
            {STEPS.map((step, index) => (
              <li key={step.title}>
                <StepCard 
                  index={index + 1} 
                  title={step.title} 
                  description={step.description} 
                />
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="benefits-title" className="ff-stack-lg">
          <h2 id="benefits-title" className="font-heading text-xl sm:text-2xl">
            Wat je krijgt
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {BENEFITS.map((benefit) => (
              <li key={benefit}>
                <span className="ff-chip text-sm">✓ {benefit}</span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="testimonials-title" className="ff-stack-lg">
          <h2 id="testimonials-title" className="font-heading text-xl sm:text-2xl">
            Waarom mensen blij zijn
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {TESTIMONIALS.map((testimonial) => (
              <TestimonialCard 
                key={testimonial.author}
                quote={testimonial.quote}
                author={testimonial.author}
                role={testimonial.role}
              />
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}