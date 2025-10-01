import React from "react";
import { NavLink } from "react-router-dom";
import PageHero from "@/components/marketing/PageHero";
import { useFadeInOnVisible } from "@/hooks/useFadeInOnVisible";
import {
  ShieldCheck,
  Sparkles,
  Handshake,
  Gauge,
  Leaf,
  CheckCircle2,
  Shapes,
  Brain,
} from "lucide-react";

type Value = { icon: React.ComponentType<any>; title: string; desc: string };
type Principle = { icon: React.ComponentType<any>; title: string; desc: string };

const VALUES: Value[] = [
  {
    icon: Sparkles,
    title: "Premium, maar nuchter",
    desc:
      "Rustige UI, heldere uitleg. Geen ruis, geen hype – wél smaak en detail.",
  },
  {
    icon: Shapes,
    title: "Stijl die klopt",
    desc:
      "Silhouet, kleur en proportie vormen de basis. We maken combinaties die je dagelijks kunt dragen.",
  },
  {
    icon: ShieldCheck,
    title: "Privacy-first",
    desc:
      "We verwerken alleen wat nodig is voor jouw advies. Transparant en zorgvuldig.",
  },
];

const PRINCIPLES: Principle[] = [
  {
    icon: Brain,
    title: "Uitlegbare AI",
    desc: "Korte context bij outfits – waarom dit werkt voor jou.",
  },
  {
    icon: Gauge,
    title: "Snel en frictieloos",
    desc: "6 vragen, direct resultaat. Zó moet tech voelen.",
  },
  {
    icon: CheckCircle2,
    title: "Kwaliteit boven kwantiteit",
    desc: "Minder keuzes, betere keuzes. Tijdloze basis, slimme accenten.",
  },
  {
    icon: Handshake,
    title: "Eerlijk en helder",
    desc: "Geen dark patterns. Upgraden is optioneel en duidelijk.",
  },
  {
    icon: Leaf,
    title: "Bewust kiezen",
    desc: "Lievere garderobes die lang meegaan dan impulsaankopen.",
  },
  {
    icon: Sparkles,
    title: "Minimalistisch design",
    desc: "Apple-strak, Lululemon-comfort: elegant én functioneel.",
  },
];

export default function AboutPage() {
  const fadeValues = useFadeInOnVisible<HTMLDivElement>({ threshold: 0.15 });
  const fadeMission = useFadeInOnVisible<HTMLDivElement>({ threshold: 0.15 });
  const fadePrinciples = useFadeInOnVisible<HTMLDivElement>({ threshold: 0.15 });
  const fadeHow = useFadeInOnVisible<HTMLDivElement>({ threshold: 0.15 });

  return (
    <main id="main" className="bg-[var(--color-bg)] text-[var(--color-text)]">
      <PageHero
        id="page-about"
        eyebrow="OVER ONS"
        title="Nuchter. Premium. Persoonlijk."
        subtitle="We bouwen AI-stijladvies dat je echt helpt: duidelijk, smaakvol en zonder ruis. Jouw tijd en privacy staan voorop."
        align="left"
        as="h1"
        size="sm"
        ctas={[
          { label: "Zo werkt het", to: "/hoe-het-werkt", variant: "primary" },
          { label: "Prijzen", to: "/prijzen", variant: "secondary" },
        ]}
      />

      {/* Onze waarden */}
      <section className="ff-container py-10 sm:py-12">
        <div
          ref={fadeValues.ref as any}
          style={{
            opacity: fadeValues.visible ? 1 : 0,
            transform: fadeValues.visible ? "translateY(0)" : "translateY(12px)",
            transition: "opacity 600ms ease, transform 600ms ease",
          }}
          className="grid gap-6 md:grid-cols-3"
        >
          {VALUES.map((v, i) => {
            const Icon = v.icon;
            return (
              <article
                key={i}
                className="rounded-[var(--radius-lg)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)] border border-[var(--color-border)]"
              >
                <Icon className="h-5 w-5 text-[var(--ff-color-primary-600)]" aria-hidden />
                <h3 className="font-heading text-lg mt-3">{v.title}</h3>
                <p className="text-[var(--color-text)]/80 mt-2">{v.desc}</p>
              </article>
            );
          })}
        </div>
      </section>

      {/* Missie & belofte */}
      <section className="ff-container py-4 sm:py-6">
        <div
          ref={fadeMission.ref as any}
          style={{
            opacity: fadeMission.visible ? 1 : 0,
            transform: fadeMission.visible ? "translateY(0)" : "translateY(12px)",
            transition: "opacity 600ms ease, transform 600ms ease",
          }}
          className="rounded-[var(--radius-lg)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)] border border-[var(--color-border)]"
        >
          <h2 className="font-heading text-2xl text-[var(--color-text)]">Onze missie</h2>
          <p className="mt-3 text-[var(--color-text)]/85">
            Stijl gaat niet om méér kopen, maar beter kiezen. Wij vertalen jouw voorkeuren naar
            combinaties die kloppen – met duidelijke uitleg en zonder ruis. Minder twijfelen, meer
            consistentie en comfort.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              {
                icon: Sparkles,
                title: "Helder advies",
                desc: "Korte redenaties per outfit – je ziet meteen waarom het werkt.",
              },
              {
                icon: ShieldCheck,
                title: "Privacy-first",
                desc: "Alleen verwerken wat strikt nodig is, transparant en zorgvuldig.",
              },
              {
                icon: CheckCircle2,
                title: "Vertrouwbaar ritme",
                desc: "Tijdloze basis + subtiele accenten. Rust en herhaalbaarheid.",
              },
            ].map((b, idx) => {
              const Icon = b.icon;
              return (
                <div
                  key={idx}
                  className="rounded-[var(--radius-lg)] bg-[var(--color-surface)] p-4 border border-[var(--color-border)]"
                >
                  <Icon className="h-5 w-5 text-[var(--ff-color-primary-600)]" aria-hidden />
                  <h3 className="font-heading text-base mt-2">{b.title}</h3>
                  <p className="text-[var(--color-text)]/80 mt-1">{b.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Principes (Apple-strak × Lululemon-comfort) */}
      <section className="ff-container py-10 sm:py-12">
        <div
          ref={fadePrinciples.ref as any}
          style={{
            opacity: fadePrinciples.visible ? 1 : 0,
            transform: fadePrinciples.visible ? "translateY(0)" : "translateY(12px)",
            transition: "opacity 600ms ease, transform 600ms ease",
          }}
          className="grid gap-6 md:grid-cols-3"
        >
          {PRINCIPLES.map((p, i) => {
            const Icon = p.icon;
            return (
              <article
                key={i}
                className="rounded-[var(--radius-lg)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)] border border-[var(--color-border)]"
              >
                <Icon className="h-5 w-5 text-[var(--ff-color-primary-600)]" aria-hidden />
                <h3 className="font-heading text-lg mt-3">{p.title}</h3>
                <p className="text-[var(--color-text)]/80 mt-2">{p.desc}</p>
              </article>
            );
          })}
        </div>
      </section>

      {/* Hoe we bouwen (timeline-achtig, compact) */}
      <section className="ff-container pb-12">
        <div
          ref={fadeHow.ref as any}
          style={{
            opacity: fadeHow.visible ? 1 : 0,
            transform: fadeHow.visible ? "translateY(0)" : "translateY(12px)",
            transition: "opacity 600ms ease, transform 600ms ease",
          }}
          className="rounded-[var(--radius-lg)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)] border border-[var(--color-border)]"
        >
          <h2 className="font-heading text-2xl text-[var(--color-text)]">Hoe we bouwen</h2>
          <ol className="mt-4 grid gap-4 md:grid-cols-3">
            {[
              {
                step: "1",
                title: "Start met de drager",
                desc: "Eerst jouw doelen en context; daarna pas looks en shoplinks.",
              },
              {
                step: "2",
                title: "Test & versimpel",
                desc: "We kiezen het minimum dat werkt. Elke stap moet rustiger voelen.",
              },
              {
                step: "3",
                title: "Leg uit, niet op",
                desc: "Transparante redenatie bij keuzes – zodat jij zelfverzekerd kunt kiezen.",
              },
            ].map((s) => (
              <li
                key={s.step}
                className="rounded-[var(--radius-lg)] bg-[var(--color-surface)] p-4 border border-[var(--color-border)]"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[var(--color-border)] text-sm">
                  {s.step}
                </span>
                <h3 className="font-heading text-base mt-2">{s.title}</h3>
                <p className="text-[var(--color-text)]/80 mt-1">{s.desc}</p>
              </li>
            ))}
          </ol>

          <div className="mt-6 flex flex-wrap gap-3">
            <NavLink to="/results" className="ff-btn ff-btn-primary">
              Start gratis
            </NavLink>
            <NavLink to="/hoe-het-werkt" className="ff-btn ff-btn-secondary">
              Zo werkt het
            </NavLink>
          </div>
        </div>
      </section>
    </main>
  );
}