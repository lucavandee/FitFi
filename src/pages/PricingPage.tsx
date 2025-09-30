import React from "react";
import { NavLink } from "react-router-dom";

type Feature = { label: string; };
const FREE: Feature[] = [
  { label: "Persoonlijk stijlprofiel" },
  { label: "Meerdere outfits met uitleg" },
  { label: "Shoplinks zonder ruis" },
];
const PLUS: Feature[] = [
  { label: "Meer looks & variaties (seizoenen)" },
  { label: "Wishlist + updates" },
  { label: "Partner-voordelen" },
];

export default function PricingPage() {
  return (
    <main id="main" className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-text)]">
      <section className="ff-container ff-page-hero">
        <span className="ff-eyebrow">Prijzen</span>
        <h1 className="ff-hero-title text-3xl md:text-5xl mt-3">Eerlijk en simpel</h1>
        <p className="ff-hero-sub mt-4 max-w-2xl">
          Start gratis. Upgraden kan later wanneer Plus live is. Geen verborgen kosten.
        </p>
      </section>

      <section className="ff-container ff-section">
        <div className="grid md:grid-cols-2 gap-6">
          <article className="ff-card">
            <div className="ff-card-body">
              <div className="flex items-baseline justify-between">
                <h2 className="font-heading text-xl">Gratis</h2>
                <div className="text-2xl font-semibold">€0</div>
              </div>
              <ul className="mt-4 space-y-2">
                {FREE.map((f, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="mt-2 inline-block h-1.5 w-1.5 rounded-full bg-[var(--ff-color-primary-600)]" />
                    <span>{f.label}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-5">
                <NavLink to="/" className="ff-btn ff-btn-primary w-full">Start gratis</NavLink>
              </div>
            </div>
          </article>

          <article className="ff-card">
            <div className="ff-card-body">
              <div className="flex items-baseline justify-between">
                <h2 className="font-heading text-xl">Plus <span className="text-[var(--color-muted)]">(binnenkort)</span></h2>
                <div className="text-2xl font-semibold">t.b.a.</div>
              </div>
              <ul className="mt-4 space-y-2">
                {PLUS.map((f, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="mt-2 inline-block h-1.5 w-1.5 rounded-full bg-[var(--ff-color-primary-600)]" />
                    <span>{f.label}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-5">
                <button className="ff-btn ff-btn-secondary w-full" disabled>Beschikbaar zodra Plus live is</button>
              </div>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}