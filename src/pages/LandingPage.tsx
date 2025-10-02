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

      {/* HERO — enige prominente CTA-moment (2 knoppen max) */}
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

      {/* Chips — kort vertrouwen, geen overload */}
      <section aria-label="Kernpunten" className="ff-section pt-2">
        <div className="ff-container--home flex flex-wrap gap-2">
          <span className="ff-eyebrow">2 min klaar</span>
          <span className="ff-eyebrow">Geen upload nodig</span>
          <span className="ff-eyebrow">Uitleg bij elke look</span>
          <span className="ff-eyebrow">Privacy-first</span>
        </div>
      </section>

      {/* In één oogopslag — 4 oneliner tiles (met 'Meer' voor volledige tekst) */}
      <section className="ff-section" aria-label="In één oogopslag">
        <div className="ff-container--home">
          <article className="ff-section-card">
            <header className="ff-section-card-head">
              <span className="ff-kicker">In één oogopslag</span>
              <h2 className="ff-section-title">Wat je krijgt</h2>
            </header>
            <div className="ff-section-card-body">
              <div className="ff-grid cols-2">
                <div className="ff-tile ff-tile--slim">
                  <h3>Snel &amp; moeiteloos</h3>
                  <p className="ff-oneliner">6 korte vragen — direct resultaat.</p>
                  <details className="ff-more">
                    <summary>Meer</summary>
                    <div className="ff-more-body">
                      6 korte vragen. Geen account of upload. Direct resultaat met heldere uitleg.
                    </div>
                  </details>
                </div>
                <div className="ff-tile ff-tile--slim">
                  <h3>Uitleg bij elke look</h3>
                  <p className="ff-oneliner">Begrijp in 1 regel waarom het werkt.</p>
                  <details className="ff-more">
                    <summary>Meer</summary>
                    <div className="ff-more-body">
                      Begrijp waarom items werken voor jouw silhouet, kleur en moment.
                    </div>
                  </details>
                </div>
                <div className="ff-tile ff-tile--slim">
                  <h3>Voorbeeld bekijken</h3>
                  <p className="ff-oneliner">Zie een écht report voor je start.</p>
                  <details className="ff-more">
                    <summary>Meer</summary>
                    <div className="ff-more-body">
                      Bekijk eerst een voorbeeld met looks, uitleg en shoplinks. Beslis daarna — zonder gedoe.
                    </div>
                  </details>
                  <p className="mt-2"><NavLink to="/results" className="ff-link" data-event="cta_view_example_text">Bekijk voorbeeld →</NavLink></p>
                </div>
                <div className="ff-tile ff-tile--slim">
                  <h3>Privacy-first</h3>
                  <p className="ff-oneliner">Alleen wat nodig is voor goed advies.</p>
                  <details className="ff-more">
                    <summary>Meer</summary>
                    <div className="ff-more-body">
                      Alleen wat nodig is. Eerlijk en transparant: korte uitleg waarom iets werkt — nuchter en praktisch.
                    </div>
                  </details>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* Zo werkt het — minimal inline steps; volledige tekst onder 'Meer' */}
      <section className="ff-section" aria-label="Zo werkt het">
        <div className="ff-container--home">
          <article className="ff-section-card">
            <header className="ff-section-card-head">
              <span className="ff-kicker">Uitleg</span>
              <h2 className="ff-section-title">Zo werkt het</h2>
            </header>
            <div className="ff-section-card-body">
              {/* Desktop: max 2 kolommen, kort en scanbaar; mobiel: timeline blijft via CSS */}
              <ul className="ff-list ff-list--spine ff-list--md-cards cols-2">
                <li className="ff-row">
                  <div className="relative">
                    <span className="sr-only">Stap 1</span>
                    <span className="ff-row-title" data-nr="1">Quick scan</span>
                  </div>
                  <p className="ff-row-sub">Kies voorkeuren en doelen. Klaar in 2 minuten.</p>
                </li>
                <li className="ff-row">
                  <div className="relative">
                    <span className="sr-only">Stap 2</span>
                    <span className="ff-row-title" data-nr="2">Match &amp; uitleg</span>
                  </div>
                  <p className="ff-row-sub">Looks die passen — met korte, heldere toelichting.</p>
                </li>
                <li className="ff-row">
                  <div className="relative">
                    <span className="sr-only">Stap 3</span>
                    <span className="ff-row-title" data-nr="3">Shop bewust</span>
                  </div>
                  <p className="ff-row-sub">Gerichte selectie. Minder miskopen.</p>
                </li>
              </ul>
              <p className="mt-3">
                <NavLink to="/hoe-het-werkt" className="ff-link">Meer over hoe het werkt →</NavLink>
              </p>
            </div>
          </article>
        </div>
      </section>

      {/* Style Report — grote visual + 1 zin; geen extra knoppen */}
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
                <p className="mt-3"><NavLink to="/results" className="ff-link" data-event="cta_view_example_text_2">Bekijk voorbeeld →</NavLink></p>
              </aside>
              <div className="ff-split-main">
                <figure className="ff-media-frame">
                  <img
                    src="/media/home/style-report.webp"
                    alt="Voorbeeld van het FitFi Style Report op mobiel"
                    loading="lazy"
                    decoding="async"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </figure>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* FAQ teaser — subtiele text-link, geen button */}
      <section className="ff-section pb-20" aria-label="FAQ">
        <div className="ff-container--home">
          <article className="ff-card">
            <div className="ff-card-body">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold">Vragen over FitFi?</h2>
                  <p className="mt-1 text-[var(--color-text)]/70">We hebben de belangrijkste antwoorden voor je op een rij.</p>
                </div>
                <NavLink to="/veelgestelde-vragen" className="ff-link">Naar FAQ →</NavLink>
              </div>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}