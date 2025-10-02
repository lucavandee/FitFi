import React from "react";
import { Helmet } from "react-helmet-async";
import { NavLink } from "react-router-dom";
import PageHero from "@/components/marketing/PageHero";

export default function LandingPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Heb ik een foto of account nodig?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Nee. Je beantwoordt 6 korte vragen en krijgt direct een Style Report. Een foto of account is niet nodig."
        }
      },
      {
        "@type": "Question",
        "name": "Hoe zit het met privacy?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We zijn privacy-first: we verzamelen alleen wat nodig is en verkopen geen data door. Zie ook onze Privacyverklaring."
        }
      },
      {
        "@type": "Question",
        "name": "Is het echt gratis?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Ja, je start gratis. Upgraden kan later als je meer wilt. Je ziet vooraf een voorbeeldrapport."
        }
      },
      {
        "@type": "Question",
        "name": "Hoe lang duurt het?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Ongeveer 2 minuten. Je ziet een voortgangsindicator en je kunt op elk moment doorgaan."
        }
      }
    ]
  };

  const howToJsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "AI Style Report in 2 minuten",
    "totalTime": "PT2M",
    "supply": [],
    "tool": [],
    "step": [
      { "@type": "HowToStep", "name": "Quick scan", "text": "Beantwoord 6 korte vragen over voorkeuren en doelen." },
      { "@type": "HowToStep", "name": "Analyse", "text": "FitFi matcht archetype, kleur en fit met uitleg." },
      { "@type": "HowToStep", "name": "Rapport + outfits", "text": "Je ontvangt een Style Report met 6–12 outfits en shoplinks." }
    ]
  };

  return (
    <main id="main" className="bg-[var(--color-bg)] text-[var(--color-text)]">
      <Helmet>
        <title>AI Style Report in 2 minuten – Persoonlijk stijladvies | FitFi</title>
        <meta
          name="description"
          content="Krijg in 2:00 een persoonlijk AI Style Report met uitleg, kleuren en 6–12 outfits. Privacy-first, EU-gericht en nuchter. Start gratis."
        />
        <meta property="og:title" content="AI Style Report in 2 minuten – FitFi" />
        <meta property="og:description" content="Zie direct wat bij je past — met uitleg en shoplinks. Start gratis." />
        <meta property="og:image" content="/hero/style-report.webp" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(howToJsonLd)}</script>
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
              src="/hero/style-report.webp"
              alt="Voorbeeld van het FitFi Style Report op mobiel"
              loading="lazy"
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

      {/* STICKY CTA BAR (desktop) — kalme microcopy + primaire CTA */}
      <div className="ff-sticky-bar" role="region" aria-label="Snelle start">
        <div className="ff-sticky-inner">
          <div className="ff-sticky-copy">
            <span className="ff-chip">Geen creditcard</span>
            <span className="ff-chip">Klaar in ± 2:00</span>
            <span className="ff-chip">Privacy-first (EU)</span>
          </div>
          <NavLink to="/onboarding" className="ff-btn ff-btn-primary" data-event="cta_start_free_sticky">Start gratis</NavLink>
        </div>
      </div>

      {/* DIFFERENTIATIE — expliciet afzetten t.o.v. generieke AI outfit tools */}
      <section className="ff-section" aria-label="Waarom FitFi anders is">
        <div className="ff-container--home">
          <article className="ff-section-card">
            <header className="ff-section-card-head">
              <span className="ff-kicker">Differentiatie</span>
              <h2 className="ff-section-title">Waarom FitFi ≠ generieke outfit-tools</h2>
            </header>
            <div className="ff-section-card-body ff-split">
              <aside className="ff-split-aside">
                <p className="ff-lede">Nuchter, uitlegbaar en EU-privacy. Geen 'black box' of spammy upsells.</p>
              </aside>
              <div className="ff-split-main">
                <div className="ff-grid cols-2">
                  <div className="ff-tile ff-tile--slim">
                    <h3>Uitleg bij elke look</h3>
                    <p className="ff-oneliner">Niet alleen plaatjes — je begrijpt waarom het werkt.</p>
                    <details className="ff-more"><summary>Meer</summary><div className="ff-more-body">Elke set bevat een korte redenatie (kleur, silhouet, moment). Dat geeft vertrouwen en versnelt keuzes.</div></details>
                  </div>
                  <div className="ff-tile ff-tile--slim">
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
          </article>
        </div>
      </section>

      {/* TRUST STRIP — badges + mini-case + testimonial (boven de vouw dicht erop) */}
      <section className="ff-section" aria-label="Trust & bewijs">
        <div className="ff-container--home">
          <article className="ff-section-card">
            <header className="ff-section-card-head">
              <span className="ff-kicker">Vertrouwen</span>
              <h2 className="ff-section-title">Proof & trust</h2>
            </header>
            <div className="ff-section-card-body ff-trust">
              <div>
                <div className="ff-badges" aria-label="Belangrijke garanties">
                  <span className="ff-badge">GDPR-proof</span>
                  <span className="ff-badge">Geen doorverkoop van data</span>
                  <span className="ff-badge">Eerlijk geprijsd</span>
                </div>
                <div className="ff-card mt-3">
                  <div className="ff-card-body">
                    <strong>Mini-case:</strong> 2-minuten scan → 9 outfits geselecteerd → 2 gerichte aankopen → minder ruis. 
                  </div>
                </div>
              </div>
              <blockquote className="ff-testimonial" cite="#">
                <div className="ff-avatar" aria-hidden="true">M</div>
                <div>
                  <p>"In 2 minuten kreeg ik outfits die ik snap. Minder zoeken, sneller klaar."</p>
                  <p className="text-[var(--color-muted)] mt-1">Marleen — Productmanager</p>
                </div>
              </blockquote>
            </div>
          </article>
        </div>
      </section>

      {/* HOE HET WERKT — 3 stappen met kleine pictogrammen */}
      <section className="ff-section" aria-label="Zo werkt het">
        <div className="ff-container--home">
          <article className="ff-section-card">
            <header className="ff-section-card-head">
              <span className="ff-kicker">Uitleg</span>
              <h2 className="ff-section-title">Zo werkt het (3 stappen)</h2>
            </header>
            <div className="ff-section-card-body">
              <ul className="ff-list ff-list--spine ff-list--md-cards cols-2">
                <li className="ff-row">
                  <div className="relative">
                    <span className="sr-only">Stap 1</span>
                    <span className="ff-row-title" data-nr="1">Quick scan</span>
                  </div>
                  <p className="ff-row-sub">Beantwoord 6 korte vragen. <span className="ff-badge">± 2:00</span></p>
                </li>
                <li className="ff-row">
                  <div className="relative">
                    <span className="sr-only">Stap 2</span>
                    <span className="ff-row-title" data-nr="2">Analyse</span>
                  </div>
                  <p className="ff-row-sub">Match op archetype, kleur en fit — met korte uitleg.</p>
                </li>
                <li className="ff-row">
                  <div className="relative">
                    <span className="sr-only">Stap 3</span>
                    <span className="ff-row-title" data-nr="3">Rapport + outfits</span>
                  </div>
                  <p className="ff-row-sub">6–12 outfits + shoplinks. Begrijp waarom het past.</p>
                </li>
              </ul>
              <p className="mt-3">
                <NavLink to="/veelgestelde-vragen" className="ff-link">Veelgestelde vragen →</NavLink>
              </p>
            </div>
          </article>
        </div>
      </section>

      {/* FAQ PREVIEW (3–5) — progressive disclosure + interne links */}
      <section className="ff-section" aria-label="FAQ preview">
        <div className="ff-container--home">
          <article className="ff-section-card">
            <header className="ff-section-card-head">
              <span className="ff-kicker">FAQ</span>
              <h2 className="ff-section-title">Veelgestelde vragen</h2>
            </header>
            <div className="ff-section-card-body ff-faq">
              <details>
                <summary>Heb ik een foto of account nodig?</summary>
                <p>Nee. 6 vragen, direct resultaat. Je kunt later upgraden of inloggen als je wilt.</p>
              </details>
              <details>
                <summary>Wat gebeurt er met mijn data?</summary>
                <p>We verzamelen alleen wat nodig is voor goed advies en verkopen geen data. Zie <NavLink to="/privacy" className="ff-link">Privacy</NavLink>.</p>
              </details>
              <details>
                <summary>Is het gratis?</summary>
                <p>Ja, starten is gratis. Je ziet eerst een voorbeeldrapport. Upgraden kan achteraf.</p>
              </details>
              <details>
                <summary>Kan ik dit overslaan en meteen een voorbeeld zien?</summary>
                <p>Ja, bekijk een <NavLink to="/results" className="ff-link">voorbeeldrapport</NavLink> voordat je start.</p>
              </details>
            </div>
          </article>
        </div>
      </section>

      {/* FOOTER TEASER — rustige afsluiter */}
      <section className="ff-section pb-20" aria-label="Start">
        <div className="ff-container--home">
          <article className="ff-card">
            <div className="ff-card-body">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold">Klaar om te starten?</h2>
                  <p className="mt-1 text-[var(--color-text)]/70">Geen creditcard · Klaar in 2:00 · Privacy-first</p>
                </div>
                <NavLink to="/onboarding" className="ff-btn ff-btn-primary" data-event="cta_start_free_footer">Start gratis</NavLink>
              </div>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}