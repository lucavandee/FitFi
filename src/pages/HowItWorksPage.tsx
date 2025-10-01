import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

export default function HowItWorksPage() {
  return (
    <main id="main">
      <Helmet>
        <title>Hoe het werkt — FitFi</title>
        <meta
          name="description"
          content="Beantwoord 6 korte vragen en ontvang direct looks die bij je passen — inclusief context, match-uitleg en shoplinks."
        />
      </Helmet>

      {/* HERO — identieke constructie als 'Prijzen': lichte band + ff-page-hero */}
      <section
        aria-label="Introductie"
        // Subtiele lichte band direct onder de header (tokens-only, geen hex)
        style={{
          background:
            "radial-gradient(1200px 220px at 50% -80px, var(--overlay-surface-12), transparent 70%), var(--color-bg)",
        }}
      >
        <div className="ff-container ff-page-hero">
          <span className="ff-eyebrow">Uitleg</span>
          <h1 className="ff-hero-title text-4xl md:text-5xl">
            Hoe FitFi werkt
          </h1>
          <p className="ff-hero-sub mt-3 max-w-prose">
            Antwoord op 6 korte vragen en ontvang direct looks die bij je passen
            — inclusief context, match-uitleg en shoplinks.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link to="/onboarding" className="ff-btn ff-btn-primary">
              Start gratis
            </Link>
            <Link to="/veelgestelde-vragen" className="ff-btn ff-btn-secondary">
              Veelgestelde vragen
            </Link>
          </div>
        </div>
      </section>

      {/* STAPPEN — laat bestaande inhoud in stand, alleen tokens/klassen voor polish */}
      <section className="ff-section">
        <div className="ff-container grid gap-4 md:grid-cols-3">
          <article className="ff-card">
            <div className="ff-card-body">
              <h3 className="font-semibold">1) Beantwoord 6 vragen</h3>
              <p className="mt-1 ff-hero-sub">
                Snel en duidelijk. Zonder account of upload. Je kiest voorkeuren
                en doelen.
              </p>
            </div>
          </article>

          <article className="ff-card">
            <div className="ff-card-body">
              <h3 className="font-semibold">2) Jouw stijlprofiel</h3>
              <p className="mt-1 ff-hero-sub">
                We berekenen je archetypen (bijv. Minimal, Smart Casual,
                Italiaans) en kleuraccenten.
              </p>
            </div>
          </article>

          <article className="ff-card">
            <div className="ff-card-body">
              <h3 className="font-semibold">3) Outfits met uitleg</h3>
              <p className="mt-1 ff-hero-sub">
                Complete sets + waarom het werkt voor jouw silhouet, kleur en
                gelegenheid.
              </p>
            </div>
          </article>

          <article className="ff-card">
            <div className="ff-card-body">
              <h3 className="font-semibold">4) Slim shoppen</h3>
              <p className="mt-1 ff-hero-sub">
                Shoplinks per item, privacy-first. We kiezen kwaliteit boven
                ruis.
              </p>
            </div>
          </article>

          <article className="ff-card">
            <div className="ff-card-body">
              <h3 className="font-semibold">5) Updates & variaties</h3>
              <p className="mt-1 ff-hero-sub">
                Later: seizoensupdates, wishlist, alternatieven in jouw smaak en
                budget.
              </p>
            </div>
          </article>

          <article className="ff-card">
            <div className="ff-card-body">
              <h3 className="font-semibold">6) Uitleg & vertrouwen</h3>
              <p className="mt-1 ff-hero-sub">
                Geen 'black box': we leggen kort uit waarom elk item matcht.
                Transparant en nuchter.
              </p>
            </div>
          </article>
        </div>
      </section>

      {/* Verwachtingen — ongewijzigde inhoud, card-stijl voor rust & consistentie */}
      <section className="ff-section">
        <div className="ff-container">
          <article className="ff-card">
            <div className="ff-card-body">
              <h2 className="text-xl font-semibold">Wat je ervan mag verwachten</h2>
              <ul className="mt-2 space-y-1 ff-hero-sub">
                <li>Rustige, premium UI — dezelfde stijl als de homepage.</li>
                <li>
                  Uitleg per outfit zodat je snapt waarom iets bij je past.
                </li>
                <li>
                  Privacy-first: alleen wat nodig is om je te adviseren.
                </li>
              </ul>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}