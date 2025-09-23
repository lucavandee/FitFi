// src/pages/AboutPage.tsx
import React from "react";
import { NavLink } from "react-router-dom";

/**
 * AboutPage — tokens-first + ff-utilities (geen hex)
 * - Missie, merkwaarden, trust elementen en CTA strip.
 * - Geen nieuwe imports buiten bestaande tooling; default export.
 */

type Value = { title: string; desc: string };
type Metric = { label: string; value: string; help?: string };

const VALUES: Value[] = [
  { title: "Persoonlijk, niet generiek", desc: "We vertalen jouw voorkeuren naar outfits die kloppen – van silhouet tot materiaal en kleur." },
  { title: "Minimal & warm", desc: "Premium, rustig en functioneel. Elke pixel heeft een reden, geen ruis of drukte." },
  { title: "Privacy-first", desc: "Jouw gegevens zijn van jou. We gebruiken antwoorden alleen om je stijl te personaliseren." },
  { title: "Eerlijk & transparant", desc: "Soms gebruiken we affiliate links; aanbevelingen blijven altijd stijl- en pasvorm-gedreven." },
  { title: "Inclusief & nuchter", desc: "We ontwerpen voor echte mensen, echte lichamen en echte situaties – zonder poeha." },
  { title: "Continu beter", desc: "We leren van feedback en passen FitFi doorlopend aan op wat voor jou werkt." },
];

const METRICS: Metric[] = [
  { label: "Vragen naar stijlprofiel", value: "6", help: "Klaar in ±2 min" },
  { label: "Outfits in Starter", value: "3", help: "Per maand" },
  { label: "Outfits in Pro", value: "10", help: "Per maand" },
  { label: "Shoplinks & alerts", value: "✓", help: "Optioneel" },
];

function ValueCard({ v, i }: { v: Value; i: number }) {
  const id = `value-${i}`;
  return (
    <article className="ff-card ff-hover-lift p-5 h-full ff-fade-in" aria-labelledby={id}>
      <div className="flex items-start gap-3">
        <div aria-hidden="true" className="shrink-0 grid place-items-center size-9 rounded-full border border-border"
          style={{ background: "color-mix(in oklab, var(--color-surface) 88%, var(--color-text))" }}>
          <span className="font-medium">{i + 1}</span>
        </div>
        <div className="min-w-0">
          <h3 id={id} className="font-heading text-lg leading-tight">{v.title}</h3>
          <p className="mt-1 text-sm text-text/80">{v.desc}</p>
        </div>
      </div>
    </article>
  );
}

function MetricCard({ m }: { m: Metric }) {
  return (
    <div className="ff-card p-4 text-center">
      <div className="font-heading text-2xl">{m.value}</div>
      <div className="text-sm text-text/80">{m.label}</div>
      {m.help && <div className="mt-1 text-xs text-text/70">{m.help}</div>}
    </div>
  );
}

export default function AboutPage() {
  return (
    <main id="main" className="bg-surface text-text">
      <section aria-labelledby="about-title" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <header className="mb-6 sm:mb-8">
          <p className="text-sm text-text/70">Over FitFi</p>
          <h1 id="about-title" className="font-heading text-2xl sm:text-3xl ff-text-balance">
            Wij maken stijl weer eenvoudig
          </h1>
          <p className="mt-2 text-text/80">
            Wij helpen je met heldere, persoonlijke outfits — zonder eindeloos scrollen of trends-ruis. 
            Met een korte vragenlijst vertalen we jouw smaak naar looks die je zó kunt aantrekken, inclusief uitleg 
            waarom het werkt voor jou. Premium, nuchter en privacy-first.
          </p>
        </header>

        <section aria-labelledby="metrics-title" className="mt-6">
          <h2 id="metrics-title" className="sr-only">Kerncijfers</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {METRICS.map((m, i) => (<MetricCard key={i} m={m} />))}
          </div>
        </section>

        <section aria-labelledby="values-title" className="mt-8 sm:mt-10">
          <h2 id="values-title" className="font-heading text-xl sm:text-2xl">Onze merkwaarden</h2>
          <p className="mt-1 text-text/80">Alles wat we bouwen toetst hieraan — van UI-details tot aanbevelingen en copy.</p>
          <ul className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {VALUES.map((v, i) => (<li key={v.title}><ValueCard v={v} i={i} /></li>))}
          </ul>
        </section>

        <section aria-labelledby="trust-title" className="mt-8 sm:mt-10">
          <h2 id="trust-title" className="font-heading text-xl sm:text-2xl">Onze beloftes</h2>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="ff-card p-4"><p className="font-medium">Geen ruis</p><p className="text-sm text-text/80">We filteren trends en focussen op wat werkt voor jouw lichaam, agenda en smaak.</p></div>
            <div className="ff-card p-4"><p className="font-medium">Leg uit, niet opleggen</p><p className="text-sm text-text/80">Je ziet waarom een look werkt (kleur, silhouet, materiaal), zodat je zelfverzekerd kiest.</p></div>
            <div className="ff-card p-4"><p className="font-medium">Jij houdt de controle</p><p className="text-sm text-text/80">Instellingen, data en alerts staan in jouw hand. Transparant en eenvoudig aan/uit.</p></div>
          </div>
        </section>

        <section aria-labelledby="cta-title" className="mt-8 sm:mt-10 ff-glass p-4 sm:p-5">
          <h2 id="cta-title" className="sr-only">Aan de slag</h2>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="font-heading text-lg">Klaar voor jouw AI Style Report?</p>
              <p className="text-sm text-text/80">
                Beantwoord 6 vragen en ontvang direct outfits met uitleg en shoplinks — gratis.
              </p>
            </div>
            <div className="flex gap-2">
              <NavLink to="/hoe-het-werkt" className="ff-btn ff-btn-primary h-10">Start gratis</NavLink>
              <NavLink to="/prijzen" className="ff-btn ff-btn-secondary h-10">Bekijk plannen</NavLink>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}