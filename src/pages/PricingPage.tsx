import React from "react";
import { NavLink } from "react-router-dom";

export default function PricingPage() {
  return (
    <main id="main" className="min-h-screen bg-[var(--color-canvas)]">
      <section className="ff-container px-4 md:px-6 ff-page-hero">
        <span className="ff-eyebrow">Prijzen</span>
        <h1 className="ff-hero-title text-3xl md:text-5xl mt-3">Eerlijk en simpel</h1>
        <p className="ff-hero-sub mt-4 max-w-2xl">
          Start gratis. Kies optioneel voor extra's zodra we plus-features activeren. Geen gedoe, geen verborgen kosten.
        </p>
      </section>

      <section className="ff-container px-4 md:px-6 ff-section">
        <div className="grid md:grid-cols-2 gap-6">
          <article className="ff-card">
            <div className="ff-card-body">
              <div className="flex items-baseline justify-between">
                <h2 className="font-heading text-xl">Gratis</h2>
                <div className="text-2xl font-semibold">€0</div>
              </div>
              <ul className="mt-4 space-y-2 ff-list-dot">
                <li><span className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[var(--ff-color-primary-600)]" /> Persoonlijk stijlprofiel</li>
                <li><span className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[var(--ff-color-primary-600)]" /> Outfits + shoplinks</li>
                <li><span className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[var(--ff-color-primary-600)]" /> Privacy-first</li>
              </ul>
              <NavLink to="/" className="ff-btn-primary mt-5 rounded-xl px-4 h-10 inline-flex items-center justify-center w-full">
                Start gratis
              </NavLink>
            </div>
          </article>

          <article className="ff-card">
            <div className="ff-card-body">
              <div className="flex items-baseline justify-between">
                <h2 className="font-heading text-xl">Plus <span className="text-[var(--color-muted)]">(binnenkort)</span></h2>
                <div className="text-2xl font-semibold">t.b.a.</div>
              </div>
              <ul className="mt-4 space-y-2 ff-list-dot">
                <li><span className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[var(--ff-color-primary-600)]" /> Meer looks & variaties</li>
                <li><span className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[var(--ff-color-primary-600)]" /> Wishlist + seizoensupdates</li>
                <li><span className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[var(--ff-color-primary-600)]" /> Partner-voordelen</li>
              </ul>
              <button className="ff-btn-ghost mt-5 rounded-xl px-4 h-10 inline-flex items-center justify-center w-full" disabled>
                Binnenkort beschikbaar
              </button>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}