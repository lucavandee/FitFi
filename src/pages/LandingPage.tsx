import React from "react";
import { Helmet } from "react-helmet-async";
import { NavLink } from "react-router-dom";
import PageHero from "@/components/marketing/PageHero";

export default function LandingPage() {
  return (
    <main id="main" className="bg-[var(--color-bg)] text-[var(--color-text)]">
      <Helmet>
        <title>AI Style Report in 2 minuten – Persoonlijk stijladvies | FitFi</title>
        <meta name="description" content="Krijg in 2:00 een persoonlijk AI Style Report met uitleg, kleuren en 6–12 outfits. Privacy-first, EU-gericht en nuchter. Start gratis." />
        <meta property="og:image" content="/hero/style-report%20copy.webp" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "FitFi",
            "description": "AI Style Report in 2 minuten – Persoonlijk stijladvies",
            "url": "https://fitfi.nl",
            "applicationCategory": "LifestyleApplication",
            "operatingSystem": "Web"
          })}
        </script>
      </Helmet>

      {/* HERO — 1 primair CTA-moment */}
      <PageHero
        eyebrow="GRATIS AI STYLE REPORT"
        title="Ontdek wat jouw stijl over je zegt"
        subtitle="Binnen 2 minuten. Rustig, duidelijk en zonder gedoe. Je krijgt direct looks met uitleg waarom het bij je past."
        align="left"
        ctas={[
          { label: "Start gratis", to: "/onboarding", variant: "primary", "data-event": "cta_start_free_home_hero" },
          { label: "Bekijk voorbeeldrapport", to: "/results", variant: "secondary", "data-event": "cta_view_example_hero" },
        ]}
      />

      {/* === HERO VISUAL — NAADLOOS === */}
      <section aria-label="Style Report voorbeeld" className="ff-hero-visual-wrap">
        <div className="ff-container--home ff-hero-visual">
          <div className="hidden lg:block" />
          <figure className="ff-media-frame ff-hero-media" aria-describedby="hero-preview-caption">
            <img
              src="/hero/style-report%20copy.webp"
              alt="Voorbeeld van het FitFi Style Report op mobiel"
              loading="eager"
              fetchPriority="high"
              decoding="async"
              sizes="(max-width: 1024px) 90vw, 560px"
            />
            <figcaption id="hero-preview-caption" className="sr-only">
              Voorbeeldrapport met archetype, kleuren en outfits.
            </figcaption>

            {/* Overlay preview mini-cards (archetype · kleur/fit · outfits) */}
            <div className="ff-hero-cards" aria-hidden="true">
              <div className="ff-hero-card">
                <h4>Archetype</h4>
                <p>Modern Minimal · clean & rustig</p>
              </div>
              <div className="ff-hero-card">
                <h4>Kleur & fit</h4>
                <p>Neutraal palet · relaxed tapered</p>
              </div>
              <div className="ff-hero-card">
                <h4>Resultaat</h4>
                <p>6–12 outfits + shoplinks</p>
              </div>
            </div>
          </figure>
        </div>
      </section>

      {/* === DIFFERENTIATIE === */}
      <section className="ff-section">
        <div className="ff-container--home">
          <div className="ff-section-card">
            <div className="ff-section-card-head">
              <span className="ff-kicker">Waarom FitFi</span>
              <h2 className="ff-section-title">Nuchter, helder en zonder gedoe</h2>
            </div>
            <div className="ff-section-card-body">
              <div className="ff-grid cols-2">
                <div className="ff-tile">
                  <h3>2 minuten, klaar</h3>
                  <p className="ff-oneliner">Geen eindeloze vragenlijsten. Gewoon de basics en je krijgt direct resultaat.</p>
                  <details className="ff-more">
                    <summary>Meer</summary>
                    <div className="ff-more-body">
                      We vragen alleen wat echt nodig is: lichaamsbouw, voorkeuren en gelegenheid. De AI doet de rest.
                    </div>
                  </details>
                </div>
                <div className="ff-tile">
                  <h3>Uitleg erbij</h3>
                  <p className="ff-oneliner">Elk outfit komt met reden waarom het bij je past. Leer over je eigen stijl.</p>
                  <details className="ff-more">
                    <summary>Meer</summary>
                    <div className="ff-more-body">
                      Geen willekeurige suggesties. Je krijgt uitleg over kleuren, silhouetten en waarom iets werkt voor jouw lichaamsbouw.
                    </div>
                  </details>
                </div>
                <div className="ff-tile">
                  <h3>Direct shopbaar</h3>
                  <p className="ff-oneliner">Alle items zijn beschikbaar bij bekende Nederlandse webshops.</p>
                  <details className="ff-more">
                    <summary>Meer</summary>
                    <div className="ff-more-body">
                      Links naar Zalando, ASOS, H&M en andere shops die je kent. Geen obscure merken of uitverkochte items.
                    </div>
                  </details>
                </div>
                <div className="ff-tile">
                  <h3>Privacy-first (EU)</h3>
                  <p className="ff-oneliner">Alleen wat nodig is, geen doorverkoop van data.</p>
                  <details className="ff-more">
                    <summary>Meer</summary>
                    <div className="ff-more-body">
                      We zijn helder over data: minimaal verzamelen, geen doorverkoop, EU-toon & beleid. <NavLink to="/privacy" className="ff-link">Privacy</NavLink>
                    </div>
                  </details>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* === TRUST & TESTIMONIALS === */}
      <section className="ff-section">
        <div className="ff-container--home">
          <div className="ff-trust">
            <div>
              <h2 className="ff-section-title">Wat anderen zeggen</h2>
              <div className="ff-badges">
                <span className="ff-badge">⭐ 4.8/5 gemiddeld</span>
                <span className="ff-badge">🇳🇱 Nederlandse focus</span>
                <span className="ff-badge">🔒 GDPR compliant</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="ff-testimonial">
                <div className="ff-avatar">M</div>
                <div>
                  <p>"Eindelijk stijladvies dat niet overdreven is. Praktisch en echt bruikbaar."</p>
                  <small className="text-[var(--color-muted)]">— Marieke, 32</small>
                </div>
              </div>
              <div className="ff-testimonial">
                <div className="ff-avatar">T</div>
                <div>
                  <p>"De uitleg waarom iets bij me past was echt eye-opening. Geen giswerk meer."</p>
                  <small className="text-[var(--color-muted)]">— Thomas, 28</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* === HOE HET WERKT === */}
      <section className="ff-section">
        <div className="ff-container--home">
          <div className="ff-section-card">
            <div className="ff-section-card-head">
              <span className="ff-kicker">Proces</span>
              <h2 className="ff-section-title">Hoe het werkt</h2>
            </div>
            <div className="ff-section-card-body">
              <ol className="ff-list ff-list--spine cols-2">
                <li className="ff-row">
                  <h3 className="ff-row-title" data-nr="1">Korte vragenlijst</h3>
                  <p className="ff-row-sub">Lichaamsbouw, voorkeuren en waar je de kleding draagt. 2 minuten max.</p>
                </li>
                <li className="ff-row">
                  <h3 className="ff-row-title" data-nr="2">AI analyseert</h3>
                  <p className="ff-row-sub">Onze AI bepaalt je stijlarchetype en matcht dit met beschikbare items.</p>
                </li>
                <li className="ff-row">
                  <h3 className="ff-row-title" data-nr="3">Persoonlijk rapport</h3>
                  <p className="ff-row-sub">Je krijgt 6-12 complete outfits met uitleg en directe shoplinks.</p>
                </li>
                <li className="ff-row">
                  <h3 className="ff-row-title" data-nr="4">Shop & draag</h3>
                  <p className="ff-row-sub">Klik door naar bekende webshops en bouw je garderobe stap voor stap op.</p>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* === FAQ === */}
      <section className="ff-section">
        <div className="ff-container--home">
          <div className="ff-section-card">
            <div className="ff-section-card-head">
              <span className="ff-kicker">Vragen</span>
              <h2 className="ff-section-title">Veelgestelde vragen</h2>
            </div>
            <div className="ff-section-card-body">
              <div className="ff-faq">
                <details>
                  <summary>Is het echt gratis?</summary>
                  <p>Ja, het basisrapport is volledig gratis. Je krijgt je stijlarchetype, kleurpalet en 6-8 outfits zonder kosten.</p>
                </details>
                <details>
                  <summary>Hoe accuraat is de AI?</summary>
                  <p>Onze AI is getraind op duizenden stijlcombinaties en houdt rekening met lichaamsbouw, kleurtype en persoonlijke voorkeuren. De meeste gebruikers zijn verrast door de accuratesse.</p>
                </details>
                <details>
                  <summary>Welke winkels worden gebruikt?</summary>
                  <p>We werken samen met bekende Nederlandse webshops zoals Zalando, ASOS, H&M, en anderen. Alle items zijn beschikbaar en leverbaar in Nederland.</p>
                </details>
                <details>
                  <summary>Wat gebeurt er met mijn data?</summary>
                  <p>We verzamelen alleen wat nodig is voor je stijladvies. Je data wordt niet doorverkocht en we houden ons aan alle EU privacy-regels. <NavLink to="/privacy" className="ff-link">Lees ons privacybeleid</NavLink>.</p>
                </details>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* === FOOTER CTA === */}
      <section className="ff-section">
        <div className="ff-container--home">
          <div className="text-center space-y-6 py-8">
            <h2 className="ff-hero-title">Klaar om je stijl te ontdekken?</h2>
            <p className="ff-hero-sub">Start nu en krijg binnen 2 minuten je persoonlijke Style Report.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <NavLink 
                to="/onboarding" 
                className="ff-btn ff-btn-primary"
                data-event="cta_start_free_footer"
              >
                Start gratis Style Report
              </NavLink>
              <NavLink 
                to="/results" 
                className="ff-btn ff-btn-secondary"
                data-event="cta_view_example_footer"
              >
                Bekijk voorbeeldrapport
              </NavLink>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}