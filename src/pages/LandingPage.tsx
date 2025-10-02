import React from "react";
import { Helmet } from "react-helmet-async";
import { NavLink } from "react-router-dom";
import PageHero from "@/components/marketing/PageHero";

export default function LandingPage() {
  return (
    <main id="main" className="bg-[var(--color-bg)] text-[var(--color-text)]">
      <Helmet>
        <title>FitFi — AI-stylist. Rust, duidelijkheid en outfits die passen.</title>
        <meta
          name="description"
          content="Beantwoord 6 korte vragen en ontvang direct outfits die bij je passen — inclusief uitleg en shoplinks. Rustige, premium UI zoals je van ons verwacht."
        />
      </Helmet>

      {/* HERO — identiek patroon als Prijzen/How-it-works */}
      <PageHero
        eyebrow="GRATIS AI STYLE REPORT"
        title="Ontdek wat jouw stijl over je zegt"
        subtitle="Binnen 2 minuten. Rustig, duidelijk en zonder gedoe. Je krijgt direct looks met uitleg waarom het bij je past."
        align="left"
        ctas={[
          { label: "Start gratis", to: "/onboarding", variant: "primary", "data-event": "cta_start_free_home" },
          { label: "Bekijk voorbeeld", to: "/results", variant: "secondary", "data-event": "cta_view_example_home" },
        ]}
      />

      {/* HERO VISUAL — ruimte voor jouw afbeelding (app-achtig, premium) */}
      {/* Mobiel: onder hero; Desktop: rechts naast hero-tekst door een 12-col grid en lege linker kolommen */}
      <section
        aria-label="Style Report visual"
        className="pt-2"
        style={{
          // subtiel doorlopen van de hero-band, tokens-only
          background:
            "radial-gradient(1200px 220px at 50% -80px, var(--overlay-surface-12), transparent 70%), var(--color-bg)",
        }}
      >
        <div className="ff-container grid md:grid-cols-12 gap-4 md:items-end">
          {/* Linker ruimte voor uitlijning met hero-tekst op desktop */}
          <div className="hidden md:block md:col-span-6" />
          {/* Visual rechts */}
          <figure className="md:col-span-6 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-soft)] overflow-hidden">
            {/* Gebruik public asset (geen import nodig) */}
            <img
              src="/media/home/style-report.webp"
              alt="Voorbeeld van het FitFi Style Report op mobiel"
              className="block w-full h-auto"
              loading="lazy"
              decoding="async"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <figcaption className="px-3 py-2 text-[var(--color-text)]/70 text-sm">
              Voorbeeld van het Style Report (mobiel) — items, palet en score.
            </figcaption>
          </figure>
        </div>
      </section>

      {/* TRUST-CHIPS — compact en direct onder hero */}
      <section aria-label="Kernpunten" className="ff-section pt-2">
        <div className="ff-container flex flex-wrap gap-2">
          <span className="ff-eyebrow">2 min klaar</span>
          <span className="ff-eyebrow">Geen upload nodig</span>
          <span className="ff-eyebrow">Uitleg bij elke look</span>
          <span className="ff-eyebrow">Privacy-first</span>
        </div>
      </section>

      {/* KERNVOORDELEN — 3-up, rustig */}
      <section className="ff-section">
        <div className="ff-container grid gap-4 md:grid-cols-3">
          <article className="ff-card">
            <div className="ff-card-body">
              <h3 className="font-semibold">Snel & moeiteloos</h3>
              <p className="mt-1 text-[var(--color-text)]/70">
                6 korte vragen. Geen account of upload. Direct resultaat met heldere uitleg.
              </p>
            </div>
          </article>
          <article className="ff-card">
            <div className="ff-card-body">
              <h3 className="font-semibold">Uitleg bij elke look</h3>
              <p className="mt-1 text-[var(--color-text)]/70">
                Begrijp waarom items werken voor jouw silhouet, kleur en moment.
              </p>
            </div>
          </article>
          <article className="ff-card">
            <div className="ff-card-body">
              <h3 className="font-semibold">Slim shoppen</h3>
              <p className="mt-1 text-[var(--color-text)]/70">
                Minder ruis, meer kwaliteit. Jij houdt de regie.
              </p>
            </div>
          </article>
        </div>
      </section>

      {/* MINI FLOW — 3 stappen */}
      <section className="ff-section">
        <div className="ff-container grid gap-4 md:grid-cols-3">
          <article className="ff-card">
            <div className="ff-card-body">
              <h3 className="font-semibold">1) Quick scan</h3>
              <p className="mt-1 text-[var(--color-text)]/70">Kies stijlvoorkeuren en doelen. Klaar in 2 minuten.</p>
            </div>
          </article>
          <article className="ff-card">
            <div className="ff-card-body">
              <h3 className="font-semibold">2) Match & uitleg</h3>
              <p className="mt-1 text-[var(--color-text)]/70">Looks die passen — met korte, heldere toelichting.</p>
            </div>
          </article>
          <article className="ff-card">
            <div className="ff-card-body">
              <h3 className="font-semibold">3) Shop bewust</h3>
              <p className="mt-1 text-[var(--color-text)]/70">Selecties op niveau. Gericht shoppen, minder miskopen.</p>
            </div>
          </article>
        </div>
      </section>

      {/* VOORBEELDRESULTAAT — callout */}
      <section className="ff-section">
        <div className="ff-container">
          <article className="ff-card">
            <div className="ff-card-body">
              <h2 className="text-xl font-semibold">Bekijk een voorbeeld</h2>
              <p className="mt-2 text-[var(--color-text)]/80">
                Eerst zien hoe een FitFi-resultaat eruitziet? Check een voorbeeld met looks, uitleg en shoplinks.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <NavLink to="/results" className="ff-btn ff-btn-secondary" data-event="cta_view_example_inline">
                  Bekijk voorbeeld
                </NavLink>
                <NavLink to="/onboarding" className="ff-btn ff-btn-primary" data-event="cta_start_free_inline">
                  Start gratis
                </NavLink>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* VERTROUWEN / PRIVACY */}
      <section className="ff-section">
        <div className="ff-container grid gap-4 md:grid-cols-2">
          <article className="ff-card">
            <div className="ff-card-body">
              <h3 className="font-semibold">Privacy-first</h3>
              <p className="mt-1 text-[var(--color-text)]/70">Alleen wat nodig is voor goed advies. Geen spam, geen gedoe.</p>
            </div>
          </article>
          <article className="ff-card">
            <div className="ff-card-body">
              <h3 className="font-semibold">Eerlijk & nuchter</h3>
              <p className="mt-1 text-[var(--color-text)]/70">Advies zonder hype — met korte uitleg waarom iets werkt.</p>
            </div>
          </article>
        </div>
      </section>

      {/* FAQ TEASER */}
      <section className="ff-section pb-20">
        <div className="ff-container">
          <article className="ff-card">
            <div className="ff-card-body">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold">Vragen over FitFi?</h2>
                  <p className="mt-1 text-[var(--color-text)]/70">We hebben de belangrijkste antwoorden voor je op een rij.</p>
                </div>
                <NavLink to="/veelgestelde-vragen" className="ff-btn ff-btn-secondary" data-event="cta_faq_home">
                  Naar FAQ
                </NavLink>
              </div>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}