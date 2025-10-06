import React from "react";
import { Helmet } from "react-helmet-async";
import { NavLink } from "react-router-dom";

export default function AboutPage() {
  return (
    <main id="main" className="bg-[var(--color-bg)] text-[var(--color-text)]">
      <Helmet>
        <title>Over ons – FitFi</title>
        <meta
          name="description"
          content="Wij bouwen een AI-gedreven stylingtool die eerlijk, rustig en effectief is. Leer ons verhaal, onze principes en onze aanpak."
        />
        <link rel="canonical" href="https://fitfi.ai/over-ons" />
      </Helmet>

      {/* Hero */}
      <section className="ff-section pt-24 sm:pt-28">
        <div className="ff-container--home">
          <h1 className="ff-h1 mb-4">Over ons</h1>
          <p className="text-[var(--color-text-muted)] max-w-2xl">
            FitFi helpt je betere kledingkeuzes te maken met AI. Geen hype, wel helderheid en rust in je stijl.
          </p>
        </div>
      </section>

      {/* Missie */}
      <section className="ff-section py-12">
        <div className="ff-container--home grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6">
            <h2 className="ff-h2 mb-3">Onze missie</h2>
            <p>
              We maken stijl eenvoudig en persoonlijk. Met privacy-vriendelijke technologie en duidelijke keuzes,
              zodat jij met minder moeite beter voor de dag komt.
            </p>
          </div>
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6">
            <h2 className="ff-h2 mb-3">Onze principes</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Rustig, precies en feitelijk.</li>
              <li>WCAG AA-toegankelijk; mobile-first.</li>
              <li>Geen dark patterns; transparante prijzen.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Proof */}
      <section className="ff-section py-12">
        <div className="ff-container--home grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6">
            <h3 className="text-xl font-semibold mb-2">EU-privacy</h3>
            <p className="text-[var(--color-text-muted)]">Data-minimalistisch en helder over wat we doen.</p>
          </div>
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6">
            <h3 className="text-xl font-semibold mb-2">Design-tokens</h3>
            <p className="text-[var(--color-text-muted)]">Consistent, snel en toegankelijk in elke view.</p>
          </div>
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6">
            <h3 className="text-xl font-semibold mb-2">Focus op resultaat</h3>
            <p className="text-[var(--color-text-muted)]">Direct bruikbare outfits en keuzes, geen ruis.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="ff-section py-16">
        <div className="ff-container--home text-center">
          <h2 className="ff-h2 mb-4">Probeer FitFi vandaag</h2>
          <p className="text-[var(--color-text-muted)] mb-8">Binnen 2 minuten een helder Style Report.</p>
          <NavLink to="/onboarding" className="ff-btn ff-btn-primary" data-event="cta_start_free_about">
            Start gratis
          </NavLink>
        </div>
      </section>
    </main>
  );
}
