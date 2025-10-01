import React from "react";
import { NavLink } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import PageHero from "@/components/marketing/PageHero";

type Step = { title: string; desc: string };

const STEPS: Step[] = [
  { title: "1) Beantwoord 6 vragen", desc: "Snel en duidelijk. Zonder account of upload. Je kiest voorkeuren en doelen." },
  { title: "2) Jouw stijlprofiel", desc: "We berekenen je archetypen (bijv. Minimal, Smart Casual, Italiaans) en kleuraccenten." },
  { title: "3) Outfits met uitleg", desc: "Complete sets + waarom het werkt voor jouw silhouet, kleur en gelegenheid." },
  { title: "4) Slim shoppen", desc: "Shoplinks per item, privacy-first. We kiezen kwaliteit boven ruis." },
  { title: "5) Updates & variaties", desc: "Later: seizoensupdates, wishlist, alternatieven in jouw smaak en budget." },
  { title: "6) Uitleg & vertrouwen", desc: "Geen 'black box': we leggen kort uit waarom elk item matcht. Transparant en nuchter." },
];

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

      {/* HERO — identiek patroon als op 'Prijzen' via PageHero */}
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

      {/* STAPPEN — bestaande inhoud, gegoten in rustige kaarten */}
      <section className="ff-section">
        <div className="ff-container grid gap-4 md:grid-cols-3">
          {STEPS.slice(0, 3).map((s) => (
            <article key={s.title} className="ff-card">
              <div className="ff-card-body">
                <h3 className="font-semibold">{s.title}</h3>
                <p className="mt-1 text-[var(--color-text)]/70">{s.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="ff-section">
        <div className="ff-container grid gap-4 md:grid-cols-3">
          {STEPS.slice(3).map((s) => (
            <article key={s.title} className="ff-card">
              <div className="ff-card-body">
                <h3 className="font-semibold">{s.title}</h3>
                <p className="mt-1 text-[var(--color-text)]/70">{s.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Verwachtingen — inhoud ongewijzigd, visueel consistent */}
      <section className="ff-section">
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