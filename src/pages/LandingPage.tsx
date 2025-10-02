import React from "react";
import { Helmet } from "react-helmet-async";
import { NavLink } from "react-router-dom";
import PageHero from "@/components/marketing/PageHero";

export default function LandingPage() {
  return (
    <main id="main" className="bg-[var(--color-bg)] text-[var(--color-text)] ff-editorial-lg">
      <Helmet>
        <title>FitFi — AI-stylist. Rust, duidelijkheid en outfits die passen.</title>
        <meta
          name="description"
          content="Beantwoord 6 korte vragen en ontvang direct outfits die bij je passen — inclusief uitleg en shoplinks."
        />
      </Helmet>

      {/* HERO */}
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

      {/* HERO VISUAL (breekt rechts uit op desktop voor editorial gevoel) */}
      <section
        aria-label="Style Report visual"
        className="pt-2"
        style={{
          background:
            "radial-gradient(1200px 220px at 50% -80px, var(--overlay-surface-12), transparent 70%), var(--color-bg)",
        }}
      >
        <div className="ff-container--home grid md:grid-cols-12 gap-4 md:items-end">
          <div className="hidden md:block md:col-span-6" />
          <figure className="ff-media-frame ff-breakout-r md:col-span-6 max-w-[560px] md:max-w-none mx-auto">
            <img
              src="/media/home/style-report.webp"
              alt="Voorbeeld van het FitFi Style Report op mobiel"
              loading="lazy"
              decoding="async"
              sizes="(max-width: 768px) 90vw, 50vw"
            />
            <figcaption className="px-3 py-2 text-[var(--color-text)]/70 text-sm">
              Voorbeeld van het Style Report — items, palet en score.
            </figcaption>
          </figure>
        </div>
      </section>

      {/* TRUST CHIPS */}
      <section aria-label="Kernpunten" className="ff-section pt-2">
        <div className="ff-container--home flex flex-wrap gap-2">
          <span className="ff-eyebrow">2 min klaar</span>
          <span className="ff-eyebrow">Geen upload nodig</span>
          <span className="ff-eyebrow">Uitleg bij elke look</span>
          <span className="ff-eyebrow">Privacy-first</span>
        </div>
      </section>

      {/* BLOK — Waarom FitFi */}
      <section className="ff-section" aria-label="Waarom FitFi">
        <div className="ff-container--home">
          <article className="ff-block ff-block--split">
            <div className="ff-block-inner">
              <aside className="ff-block-aside">
                <div>
                  <span className="ff-block-kicker">Voordelen</span>
                  <h2 className="ff-block-title mt-2">Waarom FitFi</h2>
                  <p className="ff-lede mt-2">Rustig en functioneel. Jij kiest; wij filteren de ruis.</p>
                </div>
                <div className="mt-4 hidden lg:block">
                  <NavLink to="/onboarding" className="ff-btn ff-btn-primary">Start gratis</NavLink>
                </div>
              </aside>
              <div className="ff-block-body">
                <ul className="ff-list ff-list--hairline ff-list--grid-lg-2 ff-list--grid-xl-3">
                  <li className="ff-row">
                    <div className="ff-row-title">Snel & moeiteloos</div>
                    <div className="ff-row-sub">6 korte vragen. Geen account of upload. Direct resultaat met heldere uitleg.</div>
                  </li>
                  <li className="ff-row">
                    <div className="ff-row-title">Uitleg bij elke look</div>
                    <div className="ff-row-sub">Begrijp waarom items werken voor jouw silhouet, kleur en moment.</div>
                  </li>
                  <li className="ff-row">
                    <div className="ff-row-title">Slim shoppen</div>
                    <div className="ff-row-sub">Minder ruis, meer kwaliteit. Jij houdt de regie.</div>
                  </li>
                </ul>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* BLOK — Zo werkt het (desktop horizontale rail, mobiel timeline) */}
      <section className="ff-section" aria-label="Zo werkt het">
        <div className="ff-container--home">
          <article className="ff-block ff-block--split">
            <div className="ff-block-inner">
              <aside className="ff-block-aside">
                <div>
                  <span className="ff-block-kicker">Uitleg</span>
                  <h2 className="ff-block-title mt-2">Zo werkt het</h2>
                  <p className="ff-lede mt-2">Kort en duidelijk. Geen 'black box', wél uitleg.</p>
                </div>
                <div className="mt-4 hidden lg:block">
                  <NavLink to="/veelgestelde-vragen" className="ff-btn ff-btn-secondary">Veelgestelde vragen</NavLink>
                </div>
              </aside>
              <div className="ff-block-body">
                <ul className="ff-list ff-list--spine ff-tight ff-steps ff-list--grid-lg-2 ff-list--grid-xl-3">
                  <li className="ff-row ff-row--numbered">
                    <div className="ff-row-title" data-nr="1">Quick scan</div>
                    <div className="ff-row-sub">Kies voorkeuren en doelen. Klaar in 2 minuten.</div>
                  </li>
                  <li className="ff-row ff-row--numbered">
                    <div className="ff-row-title" data-nr="2">Match & uitleg</div>
                    <div className="ff-row-sub">Looks die passen — met korte, heldere toelichting.</div>
                  </li>
                  <li className="ff-row ff-row--numbered">
                    <div className="ff-row-title" data-nr="3">Shop bewust</div>
                    <div className="ff-row-sub">Gerichte selectie. Minder miskopen.</div>
                  </li>
                </ul>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* BLOK — Style Report (breakout-image + copy) */}
      <section className="ff-section" aria-label="Style Report – preview">
        <div className="ff-container--home">
          <article className="ff-block ff-block--split">
            <div className="ff-block-inner">
              <aside className="ff-block-aside">
                <div>
                  <span className="ff-block-kicker">Preview</span>
                  <h2 className="ff-block-title mt-2">Style Report</h2>
                  <p className="ff-lede mt-2">Zie hoe jouw resultaat eruit ziet — outfits, palet en score.</p>
                </div>
                <div className="mt-4 hidden lg:block">
                  <NavLink to="/results" className="ff-btn ff-btn-secondary">Bekijk voorbeeld</NavLink>
                </div>
              </aside>
              <div className="ff-block-body grid gap-4 lg:grid-cols-2">
                <figure className="ff-media-frame ff-breakout-r">
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
                    <NavLink to="/results" className="ff-btn ff-btn-secondary" data-event="cta_view_example_inline">Bekijk voorbeeld</NavLink>
                    <NavLink to="/onboarding" className="ff-btn ff-btn-primary" data-event="cta_start_free_inline">Start gratis</NavLink>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* BLOK — Privacy & transparantie */}
      <section className="ff-section" aria-label="Vertrouwen & privacy">
        <div className="ff-container--home">
          <article className="ff-block ff-block--split">
            <div className="ff-block-inner">
              <aside className="ff-block-aside">
                <div>
                  <span className="ff-block-kicker">Vertrouwen</span>
                  <h2 className="ff-block-title mt-2">Privacy & transparantie</h2>
                  <p className="ff-lede mt-2">Alleen wat nodig is. Eerlijk advies zonder hype.</p>
                </div>
              </aside>
              <div className="ff-block-body">
                <ul className="ff-list ff-list--hairline ff-list--grid-lg-2">
                  <li className="ff-row">
                    <div className="ff-row-title">Privacy-first</div>
                    <div className="ff-row-sub">Alleen wat nodig is voor goed advies. Geen spam, geen gedoe.</div>
                  </li>
                  <li className="ff-row">
                    <div className="ff-row-title">Eerlijk & nuchter</div>
                    <div className="ff-row-sub">Korte uitleg waarom iets werkt — transparant en praktisch.</div>
                  </li>
                </ul>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* FAQ teaser */}
      <section className="ff-section pb-20">
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