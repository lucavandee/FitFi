import React from "react";
import { Helmet } from "react-helmet-async";
import PageHero from "@/components/marketing/PageHero";
import { useFadeInOnVisible } from "@/hooks/useFadeInOnVisible";
import { ShieldCheck, UserCheck, LockKeyhole, CheckCircle2, Sparkles } from "lucide-react";
import FeatureComparison, { Row as ComparisonRow } from "@/components/pricing/FeatureComparison";

type Plan = {
  id: "starter" | "pro" | "elite";
  name: string;
  description: string;
  price: { monthly: number; yearly: number };
  features: string[];
  cta: { label: string; to: string };
  popular?: boolean;
};

const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    description: "Voor wie wil kennismaken",
    price: { monthly: 0, yearly: 0 },
    features: ["3 outfits / maand", "AI-analyse", "Wishlist (beperkt)", "Basis support"],
    cta: { label: "Start gratis", to: "/results" },
  },
  {
    id: "pro",
    name: "Pro",
    description: "Voor frequente stijladviezen",
    price: { monthly: 12, yearly: 9 },
    features: ["10 outfits / maand", "AI-analyse", "Wishlist volledig", "Sneller support"],
    cta: { label: "Start met Pro", to: "/results" },
    popular: true,
  },
  {
    id: "elite",
    name: "Elite",
    description: "Voor onbeperkte inspiratie",
    price: { monthly: 24, yearly: 19 },
    features: ["Onbeperkt outfits", "AI-analyse uitgebreid", "Wishlist alerts", "Prioriteit support"],
    cta: { label: "Word Elite", to: "/results" },
  },
];

const COMPARISON: ComparisonRow[] = [
  { label: "Outfits per maand", starter: "3", pro: "10", elite: "Onbeperkt" },
  { label: "AI-analyse", starter: true, pro: true, elite: "Uitgebreid" },
  { label: "Wishlist", starter: "Beperkt", pro: "Volledig", elite: "Volledig + alerts" },
  { label: "Support", starter: "Basis", pro: "Sneller", elite: "Prioriteit" },
];

export default function PricingPage() {
  const [yearly, setYearly] = React.useState(true);

  return (
    <>
      <Helmet>
        <title>Prijzen — FitFi</title>
        <meta
          name="description"
          content="Betaal wat bij je past — begin gratis en upgrade wanneer jij er klaar voor bent. Rustig, premium en privacy-first."
        />
        <link rel="canonical" href="https://www.fitfi.ai/prijzen" />
      </Helmet>

      <main id="main" className="bg-[var(--color-bg)] text-[var(--color-text)]">
        <PageHero
          id="page-pricing"
          eyebrow="PRIJZEN"
          title="Betaal wat bij je past"
          subtitle="Begin gratis. Upgrade pas als je voelt dat het klopt."
          align="left"
          as="h1"
          size="sm"
          note="Jaar is voordeliger. Opzeggen kan altijd."
          ctas={[
            { label: "Probeer gratis", to: "/results", variant: "primary" },
            { label: "FAQ", to: "/veelgestelde-vragen", variant: "secondary" },
          ]}
        />

        {/* Periode-toggle */}
        <section className="ff-container py-6">
          <div role="group" aria-label="Prijsperiode" className="inline-flex gap-2">
            <button className="ff-btn ff-btn-secondary" aria-pressed={yearly} onClick={() => setYearly(true)}>
              Jaar
            </button>
            <button className="ff-btn ff-btn-secondary" aria-pressed={!yearly} onClick={() => setYearly(false)}>
              Maand
            </button>
          </div>
          <p className="mt-2 text-sm text-[var(--color-text)]/70">Prijzen in EUR, incl. btw waar van toepassing.</p>
        </section>

        {/* Plan-kaarten */}
        <section className="ff-container py-6">
          <div className="grid gap-6 md:grid-cols-3">
            {PLANS.map((plan) => {
              const { ref, visible } = useFadeInOnVisible<HTMLDivElement>();
              const price = yearly ? plan.price.yearly : plan.price.monthly;
              const period = yearly ? "/jr" : "/mnd";
              return (
                <div
                  key={plan.id}
                  ref={ref as any}
                  style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? "translateY(0)" : "translateY(12px)",
                    transition: "opacity 600ms ease, transform 600ms ease",
                  }}
                  className={[
                    "flex flex-col rounded-[var(--radius-lg)] border p-6 shadow-[var(--shadow-soft)]",
                    plan.popular
                      ? "border-[var(--color-primary)] bg-[color-mix(in oklab, var(--color-primary) 5%, var(--color-surface))]"
                      : "border-[var(--color-border)] bg-[var(--color-surface)]",
                  ].join(" ")}
                >
                  {plan.popular && (
                    <span className="mb-2 inline-block rounded-full bg-[var(--color-primary)]/10 px-3 py-1 text-xs font-semibold text-[var(--color-primary)]">
                      Meest gekozen
                    </span>
                  )}
                  <h3 className="font-heading text-xl">{plan.name}</h3>
                  <p className="mt-1 text-[var(--color-text)]/70">{plan.description}</p>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-bold">€{price}</span>
                    <span className="text-[var(--color-text)]/70">{period}</span>
                    {price === 0 && <span className="ml-1 text-sm text-[var(--color-text)]/70">Gratis</span>}
                  </div>
                  <ul className="mt-4 space-y-2 text-[var(--color-text)]/80">
                    {plan.features.map((f, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 size={16} className="text-[var(--color-primary)] mt-[2px]" aria-hidden />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6">
                    <a href={plan.cta.to} className={["ff-btn h-10 w-full", plan.popular ? "ff-btn-primary" : "ff-btn-secondary"].join(" ")}>
                      {plan.cta.label}
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Vertrouwen & duidelijkheid */}
        <section className="ff-container py-10">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: UserCheck, title: "Opzeggen kan altijd", desc: "Geen kleine lettertjes. Je zit nergens aan vast." },
              { icon: ShieldCheck, title: "Privacy-first", desc: "We verwerken alleen wat nodig is. Geen doorverkoop van gegevens." },
              { icon: LockKeyhole, title: "Veilige betalingen", desc: "Afrekenen via betrouwbare partners — zoals je gewend bent." },
            ].map((f, i) => {
              const { ref, visible } = useFadeInOnVisible<HTMLDivElement>();
              const Icon = f.icon;
              return (
                <article
                  key={i}
                  ref={ref as any}
                  style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? "translateY(0)" : "translateY(12px)",
                    transition: "opacity 600ms ease, transform 600ms ease",
                  }}
                  className="rounded-[var(--radius-lg)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)] border border-[var(--color-border)]"
                >
                  <Icon size={24} className="text-[var(--color-primary)]" aria-hidden />
                  <h3 className="mt-3 font-heading text-lg">{f.title}</h3>
                  <p className="mt-2 text-[var(--color-text)]/80">{f.desc}</p>
                </article>
              );
            })}
          </div>
        </section>

        {/* Functie-overzicht — nieuwe, strakke tabel */}
        <section className="ff-container py-6">
          <h2 className="font-heading text-2xl mb-3">Wat je krijgt per plan</h2>
          <FeatureComparison rows={COMPARISON} />
        </section>

        {/* Premium belofte */}
        <section className="ff-container py-10">
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)]">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-[var(--color-primary)]" aria-hidden />
              <div>
                <h2 className="font-heading text-xl">Onze belofte</h2>
                <p className="mt-2 text-[var(--color-text)]/80">
                  Rust, smaak en duidelijkheid. We adviseren wat bij je past — nuchter, uitlegbaar en zonder ruis.
                  Upgraden doe je alleen als je voelt dat het waarde toevoegt.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <a href="/results" className="ff-btn ff-btn-primary">Start gratis</a>
                  <a href="/hoe-het-werkt" className="ff-btn ff-btn-secondary">Hoe het werkt</a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="price-faq" className="ff-container pb-12">
          <h2 className="font-heading text-2xl mb-4">Veelgestelde prijs-vragen</h2>
          <div className="grid gap-3">
            {[ 
              { q: "Kan ik op elk moment opzeggen?", a: "Ja. Je zit nergens aan vast en kunt maandelijks opzeggen." },
              { q: "Welke betaalmethoden ondersteunen jullie?", a: "De gebruikelijke methoden via een betrouwbare payment provider." },
              { q: "Kan ik wisselen tussen maand en jaar?", a: "Ja. Je kunt altijd switchen; we verrekenen het verschil netjes." },
              { q: "Blijft er een gratis optie?", a: "Ja. Met Starter kun je gratis starten en later upgraden." },
            ].map((item, i) => (
              <details key={i} className="rounded-[var(--radius-lg)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-soft)] border border-[var(--color-border)]">
                <summary className="cursor-pointer font-heading">{item.q}</summary>
                <div className="mt-2 text-[var(--color-text)]/80">{item.a}</div>
              </details>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}