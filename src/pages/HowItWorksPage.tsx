import React from "react";
import { NavLink } from "react-router-dom";

export default function HowItWorksPage() {
  return (
    <main id="main" className="min-h-screen bg-[var(--color-canvas)]">
      <section className="ff-container px-4 md:px-6 ff-page-hero">
        <span className="ff-eyebrow">Uitleg</span>
        <h1 className="ff-hero-title text-3xl md:text-5xl mt-3">
          Hoe FitFi jouw persoonlijke stijladvies maakt
        </h1>
        <p className="ff-hero-sub mt-4 max-w-2xl">
          Antwoord op 6 korte vragen. Wij vertalen dat naar jouw stijlprofiel en concrete outfits met shoplinks — privacy-first, zonder ruis.
        </p>
        <div className="mt-6 flex gap-3">
          <NavLink to="/" className="ff-btn-primary rounded-xl px-4 h-10 inline-flex items-center justify-center">
            Start gratis
          </NavLink>
          <NavLink to="/veelgestelde-vragen" className="ff-btn-ghost rounded-xl px-4 h-10 inline-flex items-center justify-center">
            Veelgestelde vragen
          </NavLink>
        </div>
      </section>

      <section className="ff-container px-4 md:px-6 ff-section">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { t: "Beantwoord 6 vragen", d: "Snel, helder en zonder gedoe. Geen upload of account verplicht." },
            { t: "Jouw stijlprofiel", d: "We bepalen jouw stijl-archetypes en kleuraccenten die bij je passen." },
            { t: "Outfits + shoplinks", d: "Complete sets met context: wanneer, waarom en hoe je het combineert." },
          ].map((s,i)=>(
            <article key={i} className="ff-card">
              <div className="ff-card-body">
                <div className="font-heading text-lg text-[var(--color-text)]">{s.t}</div>
                <p className="text-[var(--color-muted)] mt-2">{s.d}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}