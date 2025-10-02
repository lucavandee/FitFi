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
          content="Beantwoord 6 korte vragen en ontvang direct outfits die bij je passen — inclusief uitleg en shoplinks."
        />
      </Helmet>

      {/* HERO (zelfde hero-balk als /prijzen) */}
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

      {/* Kernchips */}
      <section aria-label="Kernpunten" className="ff-section pt-2">
        <div className="ff-container--home flex flex-wrap gap-2">
          <span className="ff-eyebrow">2 min klaar</span>
          <span className="ff-eyebrow">Geen upload nodig</span>
          <span className="ff-eyebrow">Uitleg bij elke look</span>
          <span className="ff-eyebrow">Privacy-first</span>
        </div>
      </section>

      {/* Sectie: Waarom FitFi (kaart zoals /prijzen) */}
      <section className="ff-section" aria-label="Waarom FitFi">
        <div className="ff-container--home">
          <article className="ff-section-card">
            <header className="ff-section-card-head">
              <span className="ff-kicker">Voordelen</span>
              <h2 className="ff-section-title">Waarom FitFi</h2>
            </header>
            <div className="ff-section-card-body ff-split">
              <aside className="ff-split-aside">
                <p className="ff-lede">
                  Rustig en functioneel. Jij kiest; wij filteren de ruis.
                </p>
                <div className="mt-4 hidden lg:block">
                  <NavLink to="/onboarding" className="ff-btn ff-btn-primary">Start gratis</NavLink>
                </div>
              </aside>
              <div className="ff-split-main">
                <div className="ff-grid cols-3">
                  <div className="ff-tile">
                    <h3>Snel &amp; moeiteloos</h3>
                    <p>6 korte vragen. Geen account of upload. Direct resultaat met heldere uitleg.</p>
                  </div>
                  <div className="ff-tile">
                    <h3>Uitleg bij elke look</h3>
                    <p>Begrijp waarom items werken voor jouw silhouet, kleur en moment.</p>
                  </div>
                  <div className="ff-tile">
                    <h3>Slim shoppen</h3>
                    <p>Minder ruis, meer kwaliteit. Jij houdt de regie.</p>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* Sectie: Zo werkt het — timeline op mobiel, cards op desktop */}
      <section className="ff-section" aria-label="Zo werkt het">
        <div className="ff-container--home">
          <article className="ff-section-card">
            <header className="ff-section-card-head">
              <span className="ff-kicker">Uitleg</span>
              <h2 className="ff-section-title">Zo werkt het</h2>
            </header>
            <div className="ff-section-card-body ff-split">
              <aside className="ff-split-aside">
                <p className="ff-lede">Kort en duidelijk. Geen 'black box', wél uitleg.</p>
                <div className="mt-4 hidden lg:block">
                  <NavLink to="/veelgestelde-vragen" className="ff-btn ff-btn-secondary">Veelgestelde vragen</NavLink>
                </div>
              </aside>
              <div className="ff-split-main">
                {/* Mobiel: timeline • Desktop: cards (ff-list--md-cards) */}
                <ul className="ff-list ff-list--spine ff-list--md-cards ff-grid cols-3">
                  <li className="ff-row">
                    <div className="relative">
                      <span className="ff-step-badge">1</span>
                      <span className="ff-row-title" data-nr="1">Quick scan</span>
                    </div>
                    <p className="ff-row-sub">Kies voorkeuren en doelen. Klaar in 2 minuten.</p>
                  </li>
                  <li className="ff-row">
                    <div className="relative">
                      <span className="ff-step-badge">2</span>
                      <span className="ff-row-title" data-nr="2">Match &amp; uitleg</span>
                    </div>
                    <p className="ff-row-sub">Looks die passen — met korte, heldere toelichting.</p>
                  </li>
                  <li className="ff-row">
                    <div className="relative">
                      <span className="ff-step-badge">3</span>
                      <span className="ff-row-title" data-nr="3">Shop bewust</span>
                    </div>
                    <p className="ff-row-sub">Gerichte selectie. Minder miskopen.</p>
                  </li>
                </ul>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* Sectie: Style Report (media + copy, in sectie-kaart) */}
      <section className="ff-section" aria-label="Style Report – preview">
        <div className="ff-container--home">
          <article className="ff-section-card">
            <header className="ff-section-card-head">
              <span className="ff-kicker">Preview</span>
              <h2 className="ff-section-title">Style Report</h2>
            </header>
            <div className="ff-section-card-body ff-split">
              <aside className="ff-split-aside">
                <p className="ff-lede">Zie hoe jouw resultaat eruit ziet — outfits, palet en score.</p>
                <div className="mt-4 hidden lg:block">
                  <NavLink to="/results" className="ff-btn ff-btn-secondary">Bekijk voorbeeld</NavLink>
                </div>
              </aside>
              <div className="ff-split-main grid gap-4 lg:grid-cols-2">
                <figure className="ff-media-frame">
                  <img
                    src="/media/home/style-report.webp"
                    alt="Voorbeeld van het Style Report op mobiel"
                    loading="lazy"
                    decoding="async"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </figure>
                <div className="flex flex-col justify-between">
                  <p className="text-[var(--color-text)]/80">
                    Bekijk eerst een voorbeeld met looks, uitleg en shoplinks. Beslis daarna — zonder gedoe.
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
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* Sectie: Onze belofte (parity met /prijzen) */}
      <section className="ff-section" aria-label="Onze belofte">
        <div className="ff-container--home">
          <article className="ff-section-card">
            <header className="ff-section-card-head">
              <span className="ff-kicker">Onze belofte</span>
              <h2 className="ff-section-title">Rust, smaak en duidelijkheid</h2>
            </header>
            <div className="ff-section-card-body">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <p className="ff-lede">
                  We adviseren wat bij je past — nuchter, uitlegbaar en zonder ruis. Upgraden doe je alleen als je voelt
                  dat het waarde toevoegt.
                </p>
                <div className="flex gap-3">
                  <NavLink to="/onboarding" className="ff-btn ff-btn-primary">Start gratis</NavLink>
                  <NavLink to="/hoe-het-werkt" className="ff-btn ff-btn-secondary">Hoe het werkt</NavLink>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* FAQ teaser (kaartenstijl zoals /prijzen) */}
      <section className="ff-section pb-20" aria-label="FAQ">
        <div className="ff-container--home">
          <article className="ff-card">
            <div className="ff-card-body">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold">Vragen over FitFi?</h2>
                  <p className="mt-1 text-[var(--color-text)]/70">We hebben de belangrijkste antwoorden voor je op een rij.</p>
                </div>
                <NavLink to="/veelgestelde-vragen" className="ff-btn ff-btn-secondary">Naar FAQ</NavLink>
              </div>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}