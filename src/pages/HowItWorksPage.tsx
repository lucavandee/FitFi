import React from "react";
import { NavLink } from "react-router-dom";
import PageHero from "@/components/marketing/PageHero";
import SmartImage from "@/components/media/SmartImage";
import { useFadeInOnVisible } from "@/hooks/useFadeInOnVisible";
import { Sparkles, Brain, CheckCircle2 } from "lucide-react";

type Step = { title: string; body: string; icon: React.ComponentType<any>; };
const STEPS: Step[] = [
  {
    title: "Korte stijlscan",
    body: "Zes vragen over je smaak – er is geen goed of fout. We willen jou leren kennen.",
    icon: Sparkles,
  },
  {
    title: "Logica achter je look",
    body: "We koppelen je antwoorden aan simpele regels voor silhouet, kleur en materiaal. Zo snap je waarom iets werkt.",
    icon: Brain,
  },
  {
    title: "Outfits die meteen kloppen",
    body: "Per situatie – werk, weekend, diner. Duidelijk en overzichtelijk, zodat kiezen makkelijk wordt.",
    icon: CheckCircle2,
  },
];

const HOW_FAQ = [
  { q: "Hoe lang duurt de scan?", a: "Een paar minuten. Je bent zo klaar." },
  { q: "Wat gebeurt er met mijn gegevens?", a: "We gebruiken ze alleen voor jouw advies en verkopen ze niet door." },
  { q: "Kan ik mijn antwoorden later aanpassen?", a: "Ja, je kunt je profiel altijd bijwerken." },
  { q: "Krijg ik meteen outfits te zien?", a: "Absoluut. Je ziet direct voorbeelden per gelegenheid." }
];

export default function HowItWorksPage() {
  return (
    <main id="main" className="bg-[var(--ff-color-bg)] text-[var(--ff-color-text)]">
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
          {STEPS.map((step, i) => {
            const { ref, visible } = useFadeInOnVisible<HTMLArticleElement>();
            const Icon = step.icon;
            return (
              <article
                key={i}
                ref={ref as any}
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateY(0)" : "translateY(12px)",
                  transition: "opacity 600ms ease, transform 600ms ease",
                }}
                className="rounded-[var(--ff-radius-lg)] border border-[var(--ff-color-border)] bg-[var(--ff-color-surface)] p-6 shadow-[var(--ff-shadow-soft)]"
              >
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-[var(--ff-color-border)] bg-[color-mix(in oklab, var(--ff-color-accent) 10%, var(--ff-color-surface))] text-[var(--ff-color-accent)]">
                  <Icon size={20} aria-hidden />
                </span>
                <h3 className="mt-3 font-heading text-lg text-[var(--ff-color-text)]">{step.title}</h3>
                <p className="mt-2 text-[var(--ff-color-text)]/80">{step.body}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="ff-container py-12">
        <div className="rounded-[var(--ff-radius-lg)] border border-[var(--ff-color-border)] bg-[var(--ff-color-surface)] p-6 shadow-[var(--ff-shadow-soft)]">
          <h2 className="font-heading text-2xl text-[var(--ff-color-text)]">Korte demo</h2>
          <p className="mt-2 text-[var(--ff-color-text)]/80">
            Bekijk een voorproefje van het stijlrapport op een mobiel scherm. Dit geeft je meteen een gevoel bij het resultaat.
          </p>
          <div className="mt-4 overflow-hidden rounded-[var(--ff-radius-lg)] border border-[var(--ff-color-border)] bg-[var(--ff-color-bg)]/40">
            {/* Gebruik een statische mock-up ter vervanging van de video-placeholder */}
            <SmartImage src="/images/hero-highres.png" alt="Voorbeeld van het stijlrapport op mobiel" className="w-full h-auto" width={1200} height={800} />
          </div>
        </div>
      </section>

      <section id="faq" className="ff-container py-12">
        <h2 className="font-heading text-2xl text-[var(--ff-color-text)] mb-4">Veelgestelde vragen</h2>
        <div className="grid gap-3">
          {HOW_FAQ.map((item, i) => (
            <details key={i} className="rounded-[var(--ff-radius-lg)] border border-[var(--ff-color-border)] bg-[var(--ff-color-surface)] p-4">
              <summary className="cursor-pointer font-heading text-[var(--ff-color-text)]">{item.q}</summary>
              <div className="mt-2 text-[var(--ff-color-text)]/80">{item.a}</div>
            </details>
          ))}
        </div>
      </section>

      {/* Call-to-action blok onderaan de pagina */}
      <section className="ff-container py-10">
        <div className="flex flex-wrap gap-3">
          <a href="/results" className="ff-btn ff-btn-primary">Start gratis</a>
          <a href="/prijzen" className="ff-btn ff-btn-secondary">Bekijk plannen</a>
        </div>
      </section>
    </main>
  );
}