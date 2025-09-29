import React from "react";
import { NavLink } from "react-router-dom";
import PageHero from "@/components/marketing/PageHero";

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
    <main id="main" className="bg-bg text-text">
      <PageHero
        id="page-about"
        eyebrow="OVER ONS"
        title="Waarom wij om stijl geven"
        subtitle="Geen hype. Geen regels. Wel vertrouwen in de spiegel — elke dag."
        align="left"
        as="h1"
        size="sm"
      />

      {/* Team/waarden/metrics */}
      <section className="ff-container py-10 sm:py-12">
        <div className="grid gap-6 md:grid-cols-3">
          {VALUES.map((v, i) => (
            <article key={i} className="ff-value-card">
              <h3 className="ff-value-title">{v.title}</h3>
              <p className="ff-value-desc">{v.desc}</p>
            </article>
          ))}
        </div>

        <div className="ff-metrics mt-8">
          {METRICS.map((m, i) => (
            <div key={i} className="ff-metric">
              <div className="value">{m.value}</div>
              <div className="label">{m.label}</div>
              <div className="help">{m.help}</div>
            </div>
          ))}
        </div>

        <div className="cta-row mt-8">
          <NavLink to="/hoe-het-werkt" className="ff-btn ff-btn-secondary">Hoe het werkt</NavLink>
          <NavLink to="/prijzen" className="ff-btn ff-btn-primary">Proberen</NavLink>
        </div>
      </section>

      <section className="ff-container ff-team-grid py-8">
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