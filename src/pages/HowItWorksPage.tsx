import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { Sparkles, ClipboardCheck, ShoppingBag, Image as ImageIcon, ShieldCheck, Clock } from "lucide-react";
import Seo from "@/components/Seo";
import Button from "@/components/ui/Button";
import SmartImage from "@/components/media/SmartImage";

/**
 * How-it-Works — Editorial, rustig en premium
 * - Drie heldere stappen met icons
 * - Subtile trust & privacy beloftes (tokens-first)
 * - CTA-rail onderaan (primary + ghost)
 * - A11y: landmarks, aria-labels, semantiek
 * - Performance: geen zware assets; hero visueel optioneel met SmartImage (bestaande asset-structuur)
 */

type Step = {
  icon: React.ComponentType<{ className?: string; size?: number }>;
  title: string;
  text: string;
};

const steps: Step[] = [
  {
    icon: Sparkles,
    title: "Beantwoord 6 korte vragen",
    text: "Vertel ons je stijlvoorkeuren, doelen en context. Dit kost minder dan 2 minuten.",
  },
  {
    icon: ClipboardCheck,
    title: "Ontvang je AI Style Report",
    text: "Onze modellen analyseren je antwoorden (en optioneel je foto) voor een persoonlijk stijlprofiel.",
  },
  {
    icon: ShoppingBag,
    title: "Krijg outfits & slimme shoplinks",
    text: "Bekijk concrete outfits die écht bij je passen en shop alleen wat werkt voor jouw silhouet en kleurtemperatuur.",
  },
];

const guarantees = [
  { icon: Clock, text: "Klaar in 2 minuten" },
  { icon: ShieldCheck, text: "Privacy-first" },
  { icon: ImageIcon, text: "Foto optioneel" },
];

const Card: React.FC<{ children: React.ReactNode; className?: string; as?: "article" | "section" | "div" }> = ({
  children,
  className = "",
  as = "article",
}) => {
  const Comp = as as unknown as React.ElementType;
  return (
    <Comp
      className={
        "bg-[color:var(--color-surface)] border border-[color:var(--color-border)] rounded-[var(--radius-lg)] " +
        "shadow-[var(--shadow-soft)] " +
        className
      }
    >
      {children}
    </Comp>
  );
};

const HowItWorksPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <main className="bg-[color:var(--color-bg)] min-h-screen">
      <Seo
        title="Hoe het werkt — AI Style Report in 3 stappen | FitFi"
        description="Zo werkt FitFi: beantwoord 6 korte vragen, ontvang je AI Style Report en krijg outfits met slimme shoplinks. Privacy-first en foto optioneel."
        canonical="https://www.fitfi.ai/hoe-het-werkt"
      />

      {/* Intro / Hero */}
      <section aria-labelledby="hiw-hero" className="pt-14 md:pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <header className="lg:col-span-6">
            <h1
              id="hiw-hero"
              className="font-semibold tracking-tight text-[color:var(--color-text)]"
              style={{ fontSize: "clamp(2rem, 2.5vw + 1rem, 3.25rem)", lineHeight: 1.08 }}
            >
              AI-gestuurde styling in <span className="text-[color:var(--ff-color-primary-700)]">3 rustige stappen</span>
            </h1>
            <p
              className="mt-6 text-[color:var(--color-muted)]"
              style={{ fontSize: "clamp(1rem, .6vw + .8rem, 1.125rem)", lineHeight: 1.65 }}
            >
              Onze computer vision en ML-modellen vertalen je antwoorden naar een stijlprofiel met outfits die werken
              voor jouw silhouet, materialen en kleurtemperatuur — zonder ruis.
            </p>

            {/* Guarantees */}
            <ul className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {guarantees.map((g) => (
                <li key={g.text} className="flex items-center gap-2">
                  <g.icon className="text-[color:var(--ff-color-primary-600)]" size={18} aria-hidden="true" />
                  <span className="text-sm text-[color:var(--color-text)]">{g.text}</span>
                </li>
              ))}
            </ul>
          </header>

          {/* Visual (optioneel bestaande asset) */}
          <div className="lg:col-span-6 flex justify-center">
            <Card className="p-0 overflow-hidden" as="div">
              <SmartImage
                id="hiw-visual"
                kind="generic"
                src="/images/how-it-works/overview.jpg"
                alt="Schematische weergave van de drie stappen van het AI Style Report"
                className="w-full max-w-[560px] h-[360px] object-cover"
                priority
              />
            </Card>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section aria-labelledby="steps" className="py-14 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 id="steps" className="sr-only">Stappen</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((s) => (
              <Card key={s.title} className="p-6 hover:shadow-[var(--shadow-soft)]">
                <s.icon
                  className="text-[color:var(--ff-color-primary-600)]"
                  size={24}
                  aria-hidden="true"
                />
                <h3 className="mt-3 text-lg font-medium text-[color:var(--color-text)]">{s.title}</h3>
                <p className="mt-2 text-[color:var(--color-muted)]">{s.text}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Explainability teaser (consistent met jullie verplichting) */}
      <section aria-labelledby="explainability" className="py-2 md:py-4">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-[color:var(--color-muted)]">
          <h2 id="explainability" className="sr-only">Waarom dit werkt</h2>
          <p className="text-sm leading-relaxed">
            Bij elk outfit-advies tonen we <strong>waarom</strong> het past: silhouet, materiaal, kleurtemperatuur,
            archetype en seizoen — helder, in 1–2 zinnen.
          </p>
        </div>
      </section>

      {/* CTA rail */}
      <section aria-labelledby="cta" className="py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 id="cta" className="text-2xl md:text-3xl font-semibold text-[color:var(--color-text)]">
            Klaar voor je gratis AI Style Report?
          </h2>
          <p className="mt-3 text-[color:var(--color-muted)]">
            Start nu — geen creditcard nodig. Bekijk daarna desgewenst een voorbeeldrapport.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="primary"
              size="lg"
              className="px-7 py-4 text-base md:text-lg cta-raise"
              onClick={() => navigate("/onboarding")}
              aria-label="Start je gratis AI Style Report"
            >
              Start gratis
            </Button>

            <Button
              variant="ghost"
              size="lg"
              className="px-7 py-4 text-base md:text-lg"
              onClick={() => navigate("/results")}
              aria-label="Bekijk een voorbeeldrapport"
            >
              Bekijk voorbeeld
            </Button>
          </div>

          <p className="mt-4 text-xs text-[color:var(--color-muted)]">
            Vragen? Zie onze{" "}
            <Link to="/veelgestelde-vragen" className="underline underline-offset-4">
              veelgestelde vragen
            </Link>.
          </p>
        </div>
      </section>
    </main>
  );
};

export default HowItWorksPage;