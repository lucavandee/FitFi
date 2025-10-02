import React from "react";
import { Helmet } from "react-helmet-async";
import { NavLink } from "react-router-dom";
import PageHero from "@/components/marketing/PageHero";

export default function HowItWorksPage() {
  return (
    <main id="main" className="bg-[var(--color-bg)] text-[var(--color-text)]">
      <Helmet>
        <title>Hoe het werkt — FitFi</title>
        <meta
          name="description"
          content="Antwoord op 6 korte vragen en ontvang direct looks die bij je passen — inclusief context, match-uitleg en shoplinks."
        />
      </Helmet>

      <PageHero
        eyebrow="Uitleg"
        title="Hoe FitFi werkt"
        subtitle="Antwoord op 6 korte vragen en ontvang direct looks die bij je passen — inclusief context, match-uitleg en shoplinks."
        align="left"
        ctas={[
          { label: "Start gratis", to: "/onboarding", variant: "primary", "data-event": "cta_start_free_hiw" },
          { label: "Veelgestelde vragen", to: "/veelgestelde-vragen", variant: "secondary", "data-event": "cta_faq_hiw" },
        ]}
      />

      {/* BLOK — 6 stappen (split) */}
      <section className="ff-section" aria-label="Stappen">
        <div className="ff-container">
          <article className="ff-block ff-block--split">
            <div className="ff-block-inner">
              <aside className="ff-block-aside">
                <div>
                  <span className="ff-block-kicker">Stappen</span>
                  <h2 className="ff-block-title mt-2">Van scan naar outfits</h2>
                  <p className="ff-lede mt-2">Kort, nuchter en uitlegbaar — elke stap voegt waarde toe.</p>
                </div>
                <div className="mt-4 hidden lg:block">
                  <NavLink to="/onboarding" className="ff-btn ff-btn-primary">Start gratis</NavLink>
                </div>
              </aside>
              <div className="ff-block-body">
                <ul className="ff-list ff-list--spine ff-list--grid-md-3 ff-list--md-cards ff-tight">
                  <li className="ff-row ff-row--numbered"><div className="ff-row-title" data-nr="1">Beantwoord 6 vragen</div><div className="ff-row-sub">Snel en duidelijk. Zonder account of upload. Je kiest voorkeuren en doelen.</div></li>
                  <li className="ff-row ff-row--numbered"><div className="ff-row-title" data-nr="2">Jouw stijlprofiel</div><div className="ff-row-sub">We berekenen je archetypen (bijv. Minimal, Smart Casual, Italiaans) en kleuraccenten.</div></li>
                  <li className="ff-row ff-row--numbered"><div className="ff-row-title" data-nr="3">Outfits met uitleg</div><div className="ff-row-sub">Complete sets + waarom het werkt voor jouw silhouet, kleur en gelegenheid.</div></li>
                  <li className="ff-row ff-row--numbered"><div className="ff-row-title" data-nr="4">Slim shoppen</div><div className="ff-row-sub">Shoplinks per item, privacy-first. We kiezen kwaliteit boven ruis.</div></li>
                  <li className="ff-row ff-row--numbered"><div className="ff-row-title" data-nr="5">Updates & variaties</div><div className="ff-row-sub">Later: seizoensupdates, wishlist, alternatieven in jouw smaak en budget.</div></li>
                  <li className="ff-row ff-row--numbered"><div className="ff-row-title" data-nr="6">Uitleg & vertrouwen</div><div className="ff-row-sub">Geen 'black box': we leggen kort uit waarom elk item matcht. Transparant en nuchter.</div></li>
                </ul>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* BLOK — Verwachtingen */}
      <section className="ff-section" aria-label="Wat je ervan mag verwachten">
        <div className="ff-container">
          <article className="ff-block">
            <header className="ff-block-head">
              <span className="ff-block-kicker">Resultaat</span>
              <h2 className="ff-block-title">Wat je ervan mag verwachten</h2>
            </header>
            <div className="ff-block-body">
              <ul className="ff-list ff-list--plain ff-list--grid-md-3 ff-list--md-cards">
                <li className="ff-row"><div className="ff-row-title">Premium UI</div><div className="ff-row-sub">Rustige, premium UI — dezelfde stijl als de homepage.</div></li>
                <li className="ff-row"><div className="ff-row-title">Uitleg per outfit</div><div className="ff-row-sub">Zodat je snapt waarom iets bij je past.</div></li>
                <li className="ff-row"><div className="ff-row-title">Privacy-first</div><div className="ff-row-sub">Alleen wat nodig is om je te adviseren.</div></li>
              </ul>
              <div className="mt-4 flex flex-wrap gap-3">
                <NavLink to="/onboarding" className="ff-btn ff-btn-primary">Start gratis</NavLink>
                <NavLink to="/veelgestelde-vragen" className="ff-btn ff-btn-secondary">Veelgestelde vragen</NavLink>
              </div>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}