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
        title="Nuchter. Premium. Persoonlijk."
        subtitle="We bouwen AI-stijladvies dat je echt helpt — duidelijk, smaakvol en zonder ruis. Jouw tijd en privacy staan voorop."
        align="left"
        as="h1"
        size="sm"
        ctas={[
          { label: "Zo werkt het", to: "/hoe-het-werkt", variant: "primary" },
          { label: "Prijzen", to: "/prijzen", variant: "secondary" },
        ]}
      />

      <section className="ff-container py-10 sm:py-12">
        <div className="grid md:grid-cols-3 gap-6">
          {VALUES.map((v, i) => (
            <article key={i} className="rounded-[var(--radius-lg)] p-6 bg-[var(--color-surface)] shadow-[var(--shadow-soft)]">
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