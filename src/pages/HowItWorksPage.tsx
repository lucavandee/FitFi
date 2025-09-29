import React from "react";
import { NavLink } from "react-router-dom";
import PageHero from "@/components/marketing/PageHero";

type Step = { title: string; body: string; };
const STEPS: Step[] = [
  {
    title: "1) Korte stijlscan",
    body: "Zes vragen over je smaak – er is geen goed of fout. We willen jou leren kennen."
  },
  {
    title: "2) Logica achter je look",
    body: "We koppelen je antwoorden aan simpele regels voor silhouet, kleur en materiaal. Zo snap je waarom iets werkt."
  },
  {
    title: "3) Outfits die meteen kloppen",
    body: "Per situatie – werk, weekend, diner. Duidelijk en overzichtelijk, zodat kiezen makkelijk wordt."
  }
];

const HOW_FAQ = [
  { q: "Hoe lang duurt de scan?", a: "Een paar minuten. Je bent zo klaar." },
  { q: "Wat gebeurt er met mijn gegevens?", a: "We gebruiken ze alleen voor jouw advies en verkopen ze niet door." },
  { q: "Kan ik mijn antwoorden later aanpassen?", a: "Ja, je kunt je profiel altijd bijwerken." },
  { q: "Krijg ik meteen outfits te zien?", a: "Absoluut. Je ziet direct voorbeelden per gelegenheid." }
];

export default function HowItWorksPage() {
  return (
    <main id="main" className="bg-[var(--color-bg)] text-[var(--color-text)]">
      <PageHero
        id="page-how"
        eyebrow="GRATIS AI STYLE REPORT"
        title="Hoe FitFi werkt"
        subtitle="We leren jouw stijl kennen en laten zien wat werkt – met outfits die meteen kloppen."
        align="left"
        as="h1"
        size="lg"
        ctas={[
          { label: "Start gratis", to: "/results", variant: "primary" },
          { label: "Veelgestelde vragen", to: "#faq", variant: "secondary" }
        ]}
        note="Klaar in ±2 minuten."
      />

      <section className="ff-container py-12">
        <div className="grid gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <article
              key={i}
              className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)]"
            >
              <h3 className="font-montserrat text-lg text-[var(--color-text)]">{s.title}</h3>
              <p className="mt-2 text-[var(--color-text)]/80">{s.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="ff-container py-12">
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)]">
          <h2 className="font-montserrat text-2xl text-[var(--color-text)]">Korte demo (video volgt)</h2>
          <p className="mt-2 text-[var(--color-text)]/80">
            Hier komt een korte video van de scan en het stijlrapport. Tot die tijd zie je een rustige afbeelding of animatie.
          </p>
          <div className="mt-4 aspect-video w-full grid place-items-center rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg)]/40">
            <span className="text-[var(--color-text)]/50 text-sm">Videoplaatsing</span>
          </div>
        </div>
      </section>

      <section id="faq" className="ff-container py-12">
        <h2 className="font-montserrat text-2xl text-[var(--color-text)] mb-4">Veelgestelde vragen</h2>
        <div className="grid gap-3">
          {HOW_FAQ.map((item, i) => (
            <details key={i} className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
              <summary className="cursor-pointer font-montserrat text-[var(--color-text)]">{item.q}</summary>
              <div className="mt-2 text-[var(--color-text)]/80">{item.a}</div>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}