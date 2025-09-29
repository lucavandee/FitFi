import React from "react";
import { NavLink } from "react-router-dom";
import PageHero from "@/components/marketing/PageHero";

function DashIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" {...props}>
      <path d="M4 6h16M4 12h10M4 18h7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

const STEPS = [
  {
    title: "1) 6 vragen — klaar in ±2 min",
    desc: "We vragen naar silhouet, kleurvoorkeuren en levensstijl. Geen lange formulieren; wel slimme keuzes.",
  },
  {
    title: "2) AI vertaalt naar jouw stijlprofiel",
    desc: "Onze modellen combineren pasvorm, kleur & context tot heldere 'regels' die je helpen kiezen.",
  },
  {
    title: "3) Outfits en shoplinks zonder ruis",
    desc: "Per gelegenheid (werk/weekend/diner) met uitleg waarom het bij jou past. Jij houdt de regie.",
  },
] as const;

const MINI_FAQ = [
  { q: "Wat heb ik nodig om te starten?", a: "Niets behalve 2 minuten tijd. Je kunt later altijd je profiel verder verfijnen." },
  { q: "Worden mijn gegevens verkocht?", a: "Nee. We minimaliseren data en verkopen niets door. Privacy-first." },
  { q: "Kan ik upgraden of opzeggen?", a: "Ja. Je kunt elk moment upgraden of opzeggen; je behoudt altijd toegang tot je basisprofiel." },
  { q: "Krijg ik uitleg bij outfits?", a: "Ja. Per outfit zie je waarom kleuren/silhouet werken—rust in je keuzes." },
  { q: "Werkt dit ook met bestaande garderobe?", a: "Ja. Je kunt items bewaren, vergelijken en future-proof outfits plannen." },
];

export default function HowItWorksPage() {
  return (
    <main id="main" className="bg-[var(--color-bg)] text-[var(--color-text)]">
      <PageHero
        id="page-how"
        eyebrow="GRATIS AI STYLE REPORT"
        title="Hoe FitFi werkt"
        subtitle="Van 6 slimme vragen naar outfits die kloppen—met rust en uitleg. Jij kiest, wij vereenvoudigen."
        align="left"
        as="h1"
        size="lg"
        ctas={[
          { label: "Start gratis", to: "/results", variant: "primary" },
          { label: "Bekijk prijzen", to: "/prijzen", variant: "secondary" },
        ]}
        note="Geen spam. Opzeggen kan altijd."
      />

      {/* Diepere uitleg per stap */}
      <section className="ff-container py-10 sm:py-12">
        <header className="mb-6 sm:mb-8">
          <h2 className="font-montserrat text-2xl sm:text-3xl">Drie stappen — duidelijk en snel</h2>
          <p className="text-[var(--color-text)]/80 mt-2 max-w-2xl">
            We combineren kennis van silhouet, kleur en jouw context. Geen onnodige opties — wel goede keuzes.
          </p>
        </header>

        <div className="grid gap-6">
          {STEPS.map((s, i) => (
            <article
              key={i}
              className="grid gap-4 md:grid-cols-2 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-soft)]"
            >
              {/* Visual placeholder links/rechts om-en-om */}
              <div className={["order-1 md:order-".concat(i % 2 === 0 ? "1" : "2")].join(" ")}>
                <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg)]/60 h-48 sm:h-56 grid place-items-center">
                  <DashIcon />
                </div>
              </div>
              <div className={["order-2 md:order-".concat(i % 2 === 0 ? "2" : "1")].join(" ")}>
                <h3 className="font-montserrat text-xl">{s.title}</h3>
                <p className="text-[var(--color-text)]/80 mt-2">{s.desc}</p>
                <ul className="mt-3 grid gap-1 text-[var(--color-text)]/80">
                  <li>• Helder & snel — geen overload.</li>
                  <li>• Transparante uitleg achter elke aanbeveling.</li>
                  <li>• Past bij werk, weekend en dinersituaties.</li>
                </ul>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 flex gap-3">
          <NavLink to="/results" className="ff-btn ff-btn-primary">Start gratis</NavLink>
          <NavLink to="/veelgestelde-vragen" className="ff-btn ff-btn-secondary">FAQ</NavLink>
        </div>
      </section>

      {/* Kleine FAQ direct op de pagina */}
      <section className="ff-container py-8 sm:py-12">
        <header className="mb-4">
          <h2 className="font-montserrat text-2xl sm:text-3xl">Veelgestelde vragen</h2>
          <p className="text-[var(--color-text)]/80 mt-1">Snel antwoord—zonder je flow te doorbreken.</p>
        </header>
        <div className="grid gap-3">
          {MINI_FAQ.map((item, idx) => (
            <details key={idx} className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
              <summary className="cursor-pointer font-montserrat">{item.q}</summary>
              <p className="mt-2 text-[var(--color-text)]/80">{item.a}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}