import React from "react";
import { NavLink } from "react-router-dom";

const VALUES = [
  { title: "Persoonlijk, niet generiek", desc: "We vertalen jouw stijl naar outfits die kloppen – van silhouet tot kleur." },
  { title: "Minimal & warm", desc: "Premium, rustig en functioneel. Geen ruis of drukte." },
  { title: "Eerlijke aanbevelingen", desc: "We linken soms naar shops, maar advies blijft stijl- en pasvorm-gedreven." }
];

const METRICS = [
  { label: "Vragen naar stijlprofiel", value: "6", help: "Klaar in ±2 min" },
  { label: "Outfits in Starter", value: "3", help: "Per maand" },
  { label: "Outfits in Pro", value: "10", help: "Per maand" },
  { label: "Shoplinks & alerts", value: "✓", help: "Optioneel" }
];

export default function AboutPage() {
  return (
    <main id="main" className="ff-container ff-stack-lg bg-surface text-text">
      <section className="ff-about-hero mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="ff-stack">
          <p className="text-sm text-text/70">Over FitFi</p>
          <h1 className="font-heading text-2xl sm:text-3xl">Wij maken kleden weer makkelijk</h1>
          <p className="text-text/80">Geen eindeloos scrollen. Gewoon outfits die passen bij jouw smaak en leven.</p>
          <div className="cta-row">
            <NavLink to="/hoe-het-werkt" className="ff-btn ff-btn-secondary">Hoe het werkt</NavLink>
            <NavLink to="/prijzen" className="ff-btn ff-btn-primary">Proberen</NavLink>
          </div>
        </div>
        <div className="media">
          <div style={{ aspectRatio: "16/10", background: "var(--color-surface)" }} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {VALUES.map((v, i) => (
            <article key={i} className="ff-card p-5">
              <h3 className="font-semibold">{v.title}</h3>
              <p className="mt-1">{v.desc}</p>
            </article>
          ))}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {METRICS.map((m, i) => (
            <div key={i} className="ff-glass p-4 text-center">
              <div className="text-2xl font-bold">{m.value}</div>
              <div className="text-sm text-text/70">{m.label}</div>
              {m.help && <div className="text-xs text-text/60 mt-1">{m.help}</div>}
            </div>
          ))}
        </div>
      </section>

      <section className="ff-container ff-team-grid px-4 sm:px-6 lg:px-8 py-8">
        {[1,2,3].map((n) => (
          <article key={n} className="ff-team-card">
            <img alt="" src={`https://picsum.photos/seed/${n}/400/400`} />
            <div className="ff-team-name">Team member {n}</div>
            <div className="ff-team-role">Stylist</div>
          </article>
        ))}
      </section>
    </main>
  );
}