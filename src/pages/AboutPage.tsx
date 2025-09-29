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
        subtitle="We maken stijl eenvoudig en eerlijk—met kennis van silhouet & kleur, en respect voor jouw tijd."
        align="left"
        as="h1"
        size="sm"
        ctas={[
          { label: "Doe de stijlscan", to: "/results", variant: "primary" },
          { label: "Hoe het werkt", to: "/hoe-het-werkt", variant: "secondary" }
        ]}
      />

      {/* Missie & verhaal (op basis van jouw input) */}
      <section className="ff-container py-10 sm:py-12">
        <header className="mb-4 sm:mb-6">
          <h2 className="font-montserrat text-2xl sm:text-3xl">Ons verhaal</h2>
        </header>
        <article className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)]">
          <p className="text-[var(--color-text)]/85">
            FitFi is ontstaan uit nieuwsgierigheid: waarom staan bepaalde kleuren sommige huidtypes
            meteen goed, en andere nét niet? We merkten ook hoe tijdrovend het is om door
            eindeloze webshops te scrollen op zoek naar een paar goede, passende outfits. Dat moet
            slimmer kunnen—door kleur en silhouet te combineren met jouw leven en smaak.
          </p>
          <p className="text-[var(--color-text)]/80 mt-3">
            Daarom bouwen we aan een rustige assistent die niet meer schreeuwt, maar uitlegt. Je
            krijgt duidelijke aanbevelingen, met de reden waarom iets werkt—zodat jij zekerder
            kiest en minder koopt wat niet bij je past.
          </p>
        </article>
      </section>

      {/* Behind the scenes (zonder te veel prijs te geven) */}
      <section className="ff-container py-6 sm:py-10">
        <header className="mb-4">
          <h2 className="font-montserrat text-2xl sm:text-3xl">Behind the scenes</h2>
        </header>
        <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
          {[
            {
              t: "Silhouet-logica",
              d: "We structureren verhoudingen (lengte, proporties, snit) tot simpele regels die rust geven bij keuzes.",
            },
            {
              t: "Kleur & materiaal",
              d: "We combineren subtone en contrast met stof-eigenschappen voor draagbare combinaties.",
            },
            {
              t: "Context & gelegenheid",
              d: "Werk, weekend, diner—fit en kleur verschuiven mee met je agenda, niet andersom.",
            },
          ].map((c, i) => (
            <article key={i} className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-soft)]">
              <h3 className="font-montserrat text-lg">{c.t}</h3>
              <p className="text-[var(--color-text)]/80 mt-1">{c.d}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Sustainability & ethics */}
      <section className="ff-container py-6 sm:py-10">
        <header className="mb-4">
          <h2 className="font-montserrat text-2xl sm:text-3xl">Sustainability & ethics</h2>
        </header>
        <article className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)]">
          <ul className="grid gap-2 text-[var(--color-text)]/85">
            <li>• Minder miskopen door betere keuzes — beter voor jou én het milieu.</li>
            <li>• Data-minimalisatie en duidelijke opt-ins; we verkopen geen data.</li>
            <li>• Affiliate-links kunnen voorkomen; advies blijft stijl- en pasvorm-gedreven.</li>
            <li>• Transparante uitleg: we blijven helder over waarom iets werkt.</li>
          </ul>
        </article>

        {/* Waarden (bestaand behouden) */}
        <div className="grid gap-6 md:grid-cols-3 mt-8">
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