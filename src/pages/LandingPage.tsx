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

      {/* HERO — enige prominente CTA's op de hele pagina */}
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

      {/* Sectie: Waarom FitFi — sectie-kaart in prijzen-stijl */}
      <section className="ff-section" aria-label="Waarom FitFi">
        <div className="ff-container--home">
          <article className="ff-section-card">
            <header className="ff-section-card-head">
              <span className="ff-kicker">Voordelen</span>
              <h2 className="ff-section-title">Waarom FitFi</h2>
            </header>
            <div className="ff-section-card-body ff-split">
              <aside className="ff-split-aside">
                <p className="ff-lede">Rustig en functioneel. Jij kiest; wij filteren de ruis.</p>
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

      {/* Sectie: Zo werkt het — timeline mobiel, cards desktop (geen CTA's) */}
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
              </aside>
              <div className="ff-split-main">
                <ul className="ff-list ff-list--spine ff-list--md-cards ff-grid cols-3">
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
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* Sectie: Style Report — visual + copy (geen knoppen; rustige text-link) */}
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
                <p className="mt-3">
                  <NavLink to="/results" className="ff-link" data-event="cta_view_example_text">Bekijk voorbeeld →</NavLink>
                </p>
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
                <div className="flex flex-col justify-center">
                  <p className="text-[var(--color-text)]/80">
                    Bekijk eerst een voorbeeld met looks, uitleg en shoplinks. Beslis daarna — zonder gedoe.
                  </p>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* Sectie: Privacy & transparantie — zonder CTA's */}
      <section className="ff-section" aria-label="Vertrouwen & privacy">
        <div className="ff-container--home">
          <article className="ff-section-card">
            <header className="ff-section-card-head">
              <span className="ff-kicker">Vertrouwen</span>
              <h2 className="ff-section-title">Privacy & transparantie</h2>
            </header>
            <div className="ff-section-card-body ff-split">
              <aside className="ff-split-aside">
                <p className="ff-lede">Alleen wat nodig is. Eerlijk advies zonder hype.</p>
              </aside>
              <div className="ff-split-main">
                <div className="ff-grid cols-2">
                  <div className="ff-tile">
                    <h3>Privacy-first</h3>
                    <p>Alleen wat nodig is voor goed advies. Geen spam, geen gedoe.</p>
                  </div>
                  <div className="ff-tile">
                    <h3>Eerlijk &amp; nuchter</h3>
                    <p>Korte uitleg waarom iets werkt — transparant en praktisch.</p>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* Footer teaser — enkel subtiele text-link, geen button */}
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