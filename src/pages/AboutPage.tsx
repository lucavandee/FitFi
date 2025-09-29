import React from "react";
import { NavLink } from "react-router-dom";
import PageHero from "@/components/marketing/PageHero";

const VALUES = [
  { title: "Persoonlijk, niet generiek", desc: "We vertalen jouw stijl naar outfits die kloppen – van silhouet tot kleur." },
  { title: "Minimal & warm", desc: "Premium, rustig en functioneel. Geen ruis of drukte." },
  { title: "Eerlijk advies", desc: "We linken soms naar shops, maar aanbevelingen blijven stijl- en pasvormgedreven." }
];

export default function AboutPage() {
  return (
    <main id="main" className="bg-[var(--color-bg)] text-[var(--color-text)]">
      <PageHero
        id="page-about"
        eyebrow="OVER ONS"
        title="Waarom wij om stijl geven"
        subtitle="Geen hype. Geen regels. Wel vertrouwen in de spiegel — elke dag."
        align="left"
        as="h1"
        size="sm"
        ctas={[
          { label: "Doe de stijlscan", to: "/results", variant: "primary", "data-event": "cta_about_scan" },
          { label: "Hoe het werkt", to: "/hoe-het-werkt", variant: "secondary", "data-event": "cta_about_how" }
        ]}
      />

      <section className="ff-container py-10 sm:py-12">
        <div className="grid gap-6 md:grid-cols-3">
          {VALUES.map((v, i) => (
            <article key={i} className="rounded-[var(--radius-lg)] border border-[var(--color-border)] p-6 bg-[var(--color-surface)] shadow-[var(--shadow-soft)]">
              <h3 className="font-montserrat text-lg text-[var(--color-text)]">{v.title}</h3>
              <p className="text-[var(--color-text)]/80 mt-2">{v.desc}</p>
            </article>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <NavLink to="/prijzen" className="ff-btn ff-btn-secondary">Bekijk prijzen</NavLink>
        </div>
      </section>
    </main>
  );
}