import React from "react";
import { NavLink } from "react-router-dom";

type Step = { title: string; desc: string; };
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
    <main id="main" className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-text)]">
      <section className="ff-container ff-page-hero">
        <span className="ff-eyebrow">Uitleg</span>
        <h1 className="ff-hero-title text-3xl md:text-5xl mt-3">Hoe FitFi werkt</h1>
        <p className="ff-hero-sub mt-4 max-w-2xl">
          Antwoord op 6 korte vragen en ontvang direct looks die bij je passen — inclusief context, match-uitleg en shoplinks.
        </p>
        <div className="mt-6 flex gap-3">
          <NavLink to="/" className="ff-btn ff-btn-primary">Start gratis</NavLink>
          <NavLink to="/veelgestelde-vragen" className="ff-btn ff-btn-secondary">Veelgestelde vragen</NavLink>
        </div>
      </section>

      <section className="ff-container ff-section">
        <div className="grid md:grid-cols-3 gap-6">
          {STEPS.map((s, i) => (
            <article key={i} className="ff-card">
              <div className="ff-card-body">
                <h3 className="font-heading text-lg">{s.title}</h3>
                <p className="text-[var(--color-text)]/80 mt-2">{s.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="ff-container ff-section">
        <div className="ff-card">
          <div className="ff-card-body">
            <h2 className="font-heading text-xl">Wat je ervan mag verwachten</h2>
            <ul className="mt-3 space-y-2 list-disc pl-5 text-[var(--color-text)]/90">
              <li>Rustige, premium UI — dezelfde stijl als de homepage.</li>
              <li>Uitleg per outfit zodat je snapt waarom iets bij je past.</li>
              <li>Privacy-first: alleen wat nodig is om je te adviseren.</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}