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

      {/* 6 stappen — spine op mobiel; elevated cards op md+ */}
      <section className="ff-section" aria-label="Stappen">
        <div className="ff-container">
          <ul className="ff-list ff-list--spine ff-list--grid-md-3 ff-list--md-cards ff-tight">
            <li className="ff-row ff-row--numbered"><div className="ff-row-title" data-nr="1">Beantwoord 6 vragen</div><div className="ff-row-sub">Snel en duidelijk. Zonder account of upload. Je kiest voorkeuren en doelen.</div></li>
            <li className="ff-row ff-row--numbered"><div className="ff-row-title" data-nr="2">Jouw stijlprofiel</div><div className="ff-row-sub">We berekenen je archetypen (bijv. Minimal, Smart Casual, Italiaans) en kleuraccenten.</div></li>
            <li className="ff-row ff-row--numbered"><div className="ff-row-title" data-nr="3">Outfits met uitleg</div><div className="ff-row-sub">Complete sets + waarom het werkt voor jouw silhouet, kleur en gelegenheid.</div></li>
            <li className="ff-row ff-row--numbered"><div className="ff-row-title" data-nr="4">Slim shoppen</div><div className="ff-row-sub">Shoplinks per item, privacy-first. We kiezen kwaliteit boven ruis.</div></li>
            <li className="ff-row ff-row--numbered"><div className="ff-row-title" data-nr="5">Updates & variaties</div><div className="ff-row-sub">Later: seizoensupdates, wishlist, alternatieven in jouw smaak en budget.</div></li>
            <li className="ff-row ff-row--numbered"><div className="ff-row-title" data-nr="6">Uitleg & vertrouwen</div><div className="ff-row-sub">Geen 'black box': we leggen kort uit waarom elk item matcht. Transparant en nuchter.</div></li>
          </ul>
        </div>
      </section>

      {/* Verwachtingen — card voor ritmevariatie */}
      <section className="ff-section" aria-label="Wat je ervan mag verwachten">
        <div className="ff-container">
          <article className="ff-card">
            <div className="ff-card-body">
              <h2 className="text-xl font-semibold">Wat je ervan mag verwachten</h2>
              <ul className="mt-2 space-y-1 text-[var(--color-text)]/80">
                <li>Rustige, premium UI — dezelfde stijl als de homepage.</li>
                <li>Uitleg per outfit zodat je snapt waarom iets bij je past.</li>
                <li>Privacy-first: alleen wat nodig is om je te adviseren.</li>
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