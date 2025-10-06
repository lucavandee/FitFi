import React from "react";
import { Helmet } from "react-helmet-async";
import { NavLink } from "react-router-dom";
import { Target, Shield, Sparkles, ArrowRight } from "lucide-react";

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

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[var(--ff-color-primary-50)] via-white to-[var(--ff-color-primary-25)] py-24 md:py-32">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-[var(--ff-color-primary-100)] rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[var(--ff-color-accent-100)] rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        </div>

        <div className="ff-container relative">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-[var(--color-text)] mb-8 leading-tight">
              Over
              <span className="block text-[var(--ff-color-primary-600)]">FitFi</span>
            </h1>
            <p className="text-xl md:text-2xl text-[var(--color-text-muted)] mb-12 max-w-3xl mx-auto leading-relaxed">
              FitFi helpt je betere kledingkeuzes te maken met AI. Geen hype, wel helderheid en rust in je stijl.
            </p>
          </div>
        </div>
      </section>

      {/* Missie & Principes */}
      <section className="py-20">
        <div className="ff-container">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-2xl)] p-8 shadow-[var(--shadow-soft)]">
              <div className="w-12 h-12 rounded-full bg-[var(--ff-color-primary-100)] flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-[var(--ff-color-primary-600)]" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Onze missie</h2>
              <p className="text-[var(--color-text-muted)] text-lg leading-relaxed">
                We maken stijl eenvoudig en persoonlijk. Met privacy-vriendelijke technologie en duidelijke keuzes,
                zodat jij met minder moeite beter voor de dag komt.
              </p>
            </div>

            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-2xl)] p-8 shadow-[var(--shadow-soft)]">
              <div className="w-12 h-12 rounded-full bg-[var(--ff-color-primary-100)] flex items-center justify-center mb-6">
                <Sparkles className="w-6 h-6 text-[var(--ff-color-primary-600)]" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Onze principes</h2>
              <ul className="space-y-3 text-[var(--color-text-muted)] text-lg">
                <li className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[var(--ff-color-primary-600)] flex-shrink-0"></span>
                  <span>Rustig, precies en feitelijk</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[var(--ff-color-primary-600)] flex-shrink-0"></span>
                  <span>WCAG AA-toegankelijk; mobile-first</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[var(--ff-color-primary-600)] flex-shrink-0"></span>
                  <span>Geen dark patterns; transparante prijzen</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Wat ons onderscheidt */}
      <section className="py-20 bg-[var(--color-surface)]/30">
        <div className="ff-container">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Wat ons <span className="text-[var(--ff-color-primary-600)]">onderscheidt</span>
            </h2>
            <p className="text-xl text-[var(--color-text-muted)]">
              Transparantie, privacy en focus op resultaat staan centraal in alles wat we doen
            </p>
          </div>

          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-2xl)] p-8 shadow-[var(--shadow-soft)]">
              <div className="w-12 h-12 rounded-full bg-[var(--ff-color-primary-100)] flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-[var(--ff-color-primary-600)]" />
              </div>
              <h3 className="text-xl font-bold mb-3">EU-privacy</h3>
              <p className="text-[var(--color-text-muted)]">
                Data-minimalistisch en helder over wat we doen. Jouw privacy staat voorop.
              </p>
            </div>

            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-2xl)] p-8 shadow-[var(--shadow-soft)]">
              <div className="w-12 h-12 rounded-full bg-[var(--ff-color-primary-100)] flex items-center justify-center mb-6">
                <Sparkles className="w-6 h-6 text-[var(--ff-color-primary-600)]" />
              </div>
              <h3 className="text-xl font-bold mb-3">Design-tokens</h3>
              <p className="text-[var(--color-text-muted)]">
                Consistent, snel en toegankelijk in elke view. Premium maar nooit overdone.
              </p>
            </div>

            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-2xl)] p-8 shadow-[var(--shadow-soft)]">
              <div className="w-12 h-12 rounded-full bg-[var(--ff-color-primary-100)] flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-[var(--ff-color-primary-600)]" />
              </div>
              <h3 className="text-xl font-bold mb-3">Focus op resultaat</h3>
              <p className="text-[var(--color-text-muted)]">
                Direct bruikbare outfits en keuzes, geen ruis. Binnen 2 minuten bruikbaar advies.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="ff-container">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-[var(--ff-color-primary-50)] to-[var(--ff-color-accent-50)] rounded-[var(--radius-2xl)] p-12 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Probeer FitFi <span className="text-[var(--ff-color-primary-600)]">vandaag</span>
            </h2>
            <p className="text-xl text-[var(--color-text-muted)] mb-8">
              Binnen 2 minuten een helder Style Report. Geen account nodig.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <NavLink
                to="/onboarding"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--ff-color-primary-600)] text-white rounded-[var(--radius-xl)] font-semibold hover:bg-[var(--ff-color-primary-700)] transition-colors"
                data-event="cta_start_free_about"
              >
                Start gratis
                <ArrowRight className="w-5 h-5" />
              </NavLink>
              <NavLink
                to="/hoe-het-werkt"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white border-2 border-[var(--color-border)] rounded-[var(--radius-xl)] font-semibold hover:bg-[var(--color-surface)] transition-colors"
              >
                Hoe het werkt
              </NavLink>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
