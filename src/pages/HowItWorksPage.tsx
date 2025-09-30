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
    title: "Slimme analyse",
    body: "Je antwoorden vormen een stijlprofiel met archetypen, kleuraccenten en pasvormrichting.",
    icon: Brain,
  },
  {
    title: "Direct resultaat",
    body: "Outfits met context, waarom het werkt en shoplinks. Rustig, premium en privacy-first.",
    icon: CheckCircle2,
  },
];

export default function HowItWorksPage() {
  const ref = useFadeInOnVisible();

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

      <section className="ff-container py-10 sm:py-12">
        <div className="grid gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <article key={i} className="rounded-[var(--ff-radius-lg)] bg-[var(--ff-color-surface)] p-6 shadow-[var(--ff-shadow-soft)]">
              <div className="flex items-start gap-3">
                <s.icon className="mt-0.5 h-5 w-5 text-[var(--ff-color-primary-600)]" aria-hidden />
                <div>
                  <h3 className="font-heading text-lg">{s.title}</h3>
                  <p className="mt-1 text-[var(--ff-color-text)]/80">{s.body}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section ref={ref} className="ff-container py-12">
        <div className="rounded-[var(--ff-radius-lg)] bg-[var(--ff-color-surface)] p-6 shadow-[var(--ff-shadow-soft)]">
          <h2 className="font-heading text-2xl text-[var(--ff-color-text)]">Korte demo</h2>
          <p className="mt-2 text-[var(--ff-color-text)]/80">
            Bekijk een voorproefje van het stijlrapport op een mobiel scherm. Dit geeft je meteen een gevoel bij het resultaat.
          </p>
          <div className="mt-4 overflow-hidden rounded-[var(--ff-radius-lg)] bg-[var(--ff-color-bg)]/40">
            {/* Gebruik een statische mock-up ter vervanging van de video-placeholder */}
            <SmartImage src="/images/hero-highres.png" alt="Voorbeeld van mobiel resultaat" className="w-full h-auto" width={1200} height={800} />
          </div>
        </div>
      </section>

      <section id="faq" className="ff-container py-12">
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
              <NavLink to="/prijzen" className="ff-btn ff-btn-secondary">Bekijk prijzen</NavLink>
            </div>
          </div>

          <div className="rounded-[var(--ff-radius-lg)] bg-[var(--ff-color-surface)] p-6 shadow-[var(--ff-shadow-soft)]">
            <h2 className="font-heading text-xl">Waarom dit werkt</h2>
            <p className="mt-2 text-[var(--ff-color-text)]/80">
              We combineren je voorkeuren met beproefde stijlprincipes (silhouet, kleur, proportie) en leggen kort uit waarom keuzes passen.
            </p>
            <p className="mt-2 text-[var(--ff-color-text)]/80">
              Geen black box: we kiezen helderheid boven hype.
            </p>
          </div>
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