import React from "react";
import { NavLink } from "react-router-dom";
import PageHero from "@/components/marketing/PageHero";

type Step = { title: string; body: string; };
const STEPS: Step[] = [
  {
    title: "1) Korte stijlscan",
    body: "Zes vragen over wat je mooi vindt en wat niet. Geen goede of foute antwoorden – we willen jouw smaak begrijpen."
  },
  {
    title: "2) Logica achter jouw stijl",
    body: "We koppelen je antwoorden aan kleur, silhouet en materiaal. Zo zie je waarom iets werkt, niet alleen dát het werkt."
  },
  {
    title: "3) Outfits die je meteen kunt dragen",
    body: "Per gelegenheid: werk, weekend, diner. Rustig gepresenteerd, zodat kiezen makkelijk wordt."
  }
];

const HOW_FAQ = [
  { q: "Hoe lang duurt de scan?", a: "Ongeveer twee minuten. Je bent zo klaar." },
  { q: "Wat gebeurt er met mijn gegevens?", a: "We vragen weinig en gebruiken het alleen voor je stijladvies. Geen doorverkoop." },
  { q: "Kan ik later iets wijzigen?", a: "Ja. Je kunt altijd terug naar je profiel om aan te passen." },
  { q: "Heb ik direct outfits?", a: "Ja, je ziet meteen voorbeelden per gelegenheid." }
];

export default function HowItWorksPage() {
  return (
    <main id="main" className="bg-[var(--color-bg)] text-[var(--color-text)]">
      <PageHero
        id="page-how"
        eyebrow="GRATIS AI STYLE REPORT"
        title="Hoe FitFi werkt"
        subtitle="Eerst begrijpen we je smaak. Daarna laten we zien wat voor jou werkt – met outfits die je zo kunt dragen."
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

      {/* Demo placeholder */}
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

      {/* Inline FAQ */}
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