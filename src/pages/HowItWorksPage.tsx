import React from "react";
import { NavLink } from "react-router-dom";
import PageHero from "@/components/marketing/PageHero";
import SmartImage from "@/components/media/SmartImage";
import { useFadeInOnVisible } from "@/hooks/useFadeInOnVisible";
import { Sparkles, Brain, CircleCheck as CheckCircle2 } from "lucide-react";

type Step = { title: string; body: string; icon: React.ComponentType<any>; };

const STEPS: Step[] = [
  {
    title: "Korte stijlscan",
    body: "Zes vragen over je smaak – er is geen goed of fout. We willen jou leren kennen.",
    icon: Sparkles,
  },
  {
    title: "Logica achter je look",
    body: "We vertalen je antwoorden naar stijl-archetypen, kleuraccenten en pasvormrichting.",
    icon: Brain,
  },
  {
    title: "Direct resultaat",
    body: "Complete outfits met context: waarom het werkt en hoe je het combineert, inclusief shoplinks.",
    icon: CheckCircle2,
  },
];

const HOW_FAQ = [
  { q: "Hoe lang duurt de scan?", a: "Een paar minuten. Je ziet meteen meerdere outfits met uitleg en shoplinks." },
  { q: "Heb ik een account nodig?", a: "Nee, je kunt direct starten. Later kun je optioneel upgraden wanneer Plus live is." },
  { q: "Wat gebeurt er met mijn data?", a: "We werken privacy-first en verwerken alleen wat nodig is om je te adviseren. Geen ruis." },
  { q: "Krijg ik echte combinaties?", a: "Ja. We geven outfits die je vandaag kunt dragen, met duidelijke redenatie per item." },
];

export default function HowItWorksPage() {
  // zachte in-view animatie, styling blijft identiek
  const { ref, visible } = useFadeInOnVisible({ threshold: 0.2 });

  return (
    <main id="main" className="bg-[var(--color-bg)] text-[var(--color-text)]">
      <PageHero
        id="page-how"
        eyebrow="UITLEG"
        title="Hoe FitFi werkt"
        subtitle="Antwoord op 6 korte vragen en ontvang direct looks die bij je passen — inclusief context, match-uitleg en shoplinks."
        align="left"
        as="h1"
        size="sm"
        ctas={[
          { label: "Start gratis", to: "/results", variant: "primary", "data-event": "cta_how_start" },
          { label: "FAQ", to: "/veelgestelde-vragen", variant: "secondary" },
        ]}
      />

      {/* 1) Stappen — premium kaarten, styling exact in je huidige taal */}
      <section className="ff-container py-10 sm:py-12">
        <div className="grid gap-6 md:grid-cols-3">
          {STEPS.map((step, i) => {
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
                className="rounded-[var(--ff-radius-lg)] bg-[var(--ff-color-surface)] p-6 shadow-[var(--ff-shadow-soft)]"
              >
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[var(--ff-color-primary-700)] text-white">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="font-heading text-lg mt-3">{step.title}</h3>
                <p className="text-[var(--ff-color-text)]/80 mt-2">{step.body}</p>
              </article>
            );
          })}
        </div>
      </section>

      {/* 2) Voorbeeld (mockup) — geen video; exact jouw visuele ritme */}
      <section className="ff-container py-12">
        <div className="rounded-[var(--ff-radius-lg)] bg-[var(--ff-color-surface)] p-6 shadow-[var(--ff-shadow-soft)]">
          <h2 className="font-heading text-2xl text-[var(--ff-color-text)]">Voorbeeld van het resultaat</h2>
          <p className="mt-2 text-[var(--ff-color-text)]/80">
            Een snelle indruk van het stijlrapport op mobiel. Rustig, premium en privacy-first.
          </p>
          <div className="mt-4 overflow-hidden rounded-[var(--ff-radius-lg)] bg-[var(--ff-color-bg)]/40">
            <SmartImage
              id="hero-highres"        /* gebruik je bestaande asset-id (wijzigen is niet nodig) */
              src="/images/hero-highres.png"
              alt="Voorbeeld van mobiel resultaat"
              className="w-full h-auto"
              width={1200}
              height={800}
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* 3) Wat je krijgt / Waarom het werkt — twee heldere info-kaarten */}
      <section className="ff-container py-12">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-[var(--ff-radius-lg)] bg-[var(--ff-color-surface)] p-6 shadow-[var(--ff-shadow-soft)]">
            <h2 className="font-heading text-xl">Wat je krijgt</h2>
            <ul className="mt-3 list-disc pl-5 text-[var(--ff-color-text)]/85">
              <li>Meerdere outfits met context en combinatietips</li>
              <li>Korte, duidelijke uitleg per item</li>
              <li>Shoplinks zonder ruis</li>
              <li>Privacy-first</li>
            </ul>
            <div className="mt-4 flex gap-3">
              <NavLink to="/results" className="ff-btn ff-btn-primary">Start gratis</NavLink>
              <NavLink to="/prijzen" className="ff-btn ff-btn-secondary">Bekijk plannen</NavLink>
            </div>
          </div>

          <div className="rounded-[var(--ff-radius-lg)] bg-[var(--ff-color-surface)] p-6 shadow-[var(--ff-shadow-soft)]">
            <h2 className="font-heading text-xl">Waarom dit werkt</h2>
            <p className="mt-2 text-[var(--ff-color-text)]/80">
              We combineren je voorkeuren met beproefde stijlprincipes (silhouet, kleur, proportie) en leggen kort uit
              waarom keuzes passen. Geen black box; helder en nuchter.
            </p>
            <p className="mt-2 text-[var(--ff-color-text)]/80">
              Zo kun je consistent keuzes maken die goed voelen en er beter uitzien, elke dag.
            </p>
          </div>
        </div>
      </section>

      {/* 4) Veelgestelde vragen — compacte accordion in jouw stijl */}
      <section className="ff-container py-12">
        <h2 className="font-heading text-xl text-[var(--ff-color-text)] mb-4">Veelgestelde vragen</h2>
        <div className="rounded-[var(--ff-radius-lg)] bg-[var(--ff-color-surface)] shadow-[var(--ff-shadow-soft)]">
          {HOW_FAQ.map((item, idx) => (
            <details key={idx} className="border-t border-[var(--ff-color-border)] first:border-t-0 p-4">
              <summary className="cursor-pointer font-heading text-[var(--ff-color-text)]">
                {item.q}
              </summary>
              <div className="mt-2 text-[var(--ff-color-text)]/80">
                {item.a}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* 5) Primary CTA onderaan */}
      <section className="ff-container py-10">
        <div className="flex flex-wrap gap-3">
          <NavLink to="/results" className="ff-btn ff-btn-primary">Start gratis</NavLink>
          <NavLink to="/prijzen" className="ff-btn ff-btn-secondary">Bekijk plannen</NavLink>
        </div>
      </section>
    </main>
  );
}