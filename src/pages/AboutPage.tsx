import React from "react";
import { NavLink } from "react-router-dom";

const VALUES = [
  { title: "Persoonlijk, niet generiek", desc: "We vertalen jouw stijl naar outfits die kloppen – van silhouet tot kleur." },
  { title: "Minimal & warm", desc: "Premium, rustig en functioneel. Geen ruis of drukte." },
  { title: "Eerlijk advies", desc: "We linken soms naar shops, maar aanbevelingen blijven stijl- en pasvormgedreven." }
];

export default function AboutPage() {
  return (
    <main id="main" className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-text)]">
      <section className="ff-container ff-page-hero">
        <span className="ff-eyebrow">Over ons</span>
        <h1 className="ff-hero-title text-3xl md:text-5xl mt-3">Nuchter. Premium. Persoonlijk.</h1>
        <p className="ff-hero-sub mt-4 max-w-2xl">
          Wij bouwen AI-stijladvies dat je echt helpt: duidelijk, smaakvol en zonder ruis. Jouw tijd en privacy staan voorop.
        </p>
        <div className="mt-6">
          <NavLink to="/hoe-het-werkt" className="ff-btn ff-btn-primary">Zo werkt het</NavLink>
        </div>
      </section>

      <section className="ff-container ff-section">
        <div className="grid md:grid-cols-3 gap-6">
          {VALUES.map((v, i) => (
            <article key={i} className="ff-card">
              <div className="ff-card-body">
                <h3 className="font-heading text-lg text-[var(--color-text)]">{v.title}</h3>
                <p className="text-[var(--color-text)]/80 mt-2">{v.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="ff-container ff-section">
        <div className="ff-card">
          <div className="ff-card-body">
            <h2 className="font-heading text-xl">Waarom we FitFi maken</h2>
            <p className="mt-3 text-[var(--color-text)]/90">
              Stijl gaat niet om meer kopen, maar beter kiezen. Met duidelijke uitleg en combinaties die je dagelijks kunt dragen.
              We houden het rustig, eerlijk en functioneel — precies zoals onze UI.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}