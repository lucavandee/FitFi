import React from "react";
import { Helmet } from "react-helmet-async";
import PageHero from "@/components/marketing/PageHero";
import { useFadeInOnVisible } from "@/hooks/useFadeInOnVisible";
import { ShieldCheck, UserCheck, LockKeyhole, CheckCircle2 } from "lucide-react";

type Row = { label: string; starter: boolean | string; pro: boolean | string; elite: boolean | string; };

const ROWS: Row[] = [
  { label: "Outfits per maand", starter: "3", pro: "10", elite: "Onbeperkt" },
  { label: "AI-analyse", starter: true, pro: true, elite: "Uitgebreid" },
  { label: "Wishlist", starter: "Beperkt", pro: "Volledig", elite: "Volledig + alerts" },
  { label: "Support", starter: "Basis", pro: "Sneller", elite: "Prioriteit" },
];

const PRICE_FAQ = [
  { q: "Blijft gratis ook echt gratis?", a: "Ja. De gratis variant blijft bestaan, met een eerlijk pakket aan features." },
  { q: "Wat is Plus?", a: "Plus voegt extra looks, wishlist en updates toe. Eerlijk geprijsd, zonder verborgen kosten." },
  { q: "Kan ik upgraden/downgraden?", a: "Ja. Je kunt op elk moment wisselen. We rekenen fair pro-rata." },
];

export default function PricingPage() {
  const ref = useFadeInOnVisible();

  return (
    <>
      <Helmet>
        <title>Prijzen — FitFi</title>
      </Helmet>

      <main id="main" className="bg-[var(--color-bg)] text-[var(--color-text)]">
        <PageHero
          id="page-pricing"
          eyebrow="PRIJZEN"
          title="Eerlijk en simpel"
          subtitle="Start gratis. Upgraden kan later wanneer Plus live is. Geen verborgen kosten."
          align="left"
          as="h1"
          size="sm"
        />

        <section className="ff-container py-10 sm:py-12">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { name: "Starter", price: "€0", badge: "Gratis", features: ROWS.map(r => r.starter) },
              { name: "Pro", price: "t.b.a.", badge: "Binnenkort", features: ROWS.map(r => r.pro) },
              { name: "Elite", price: "t.b.a.", badge: "Binnenkort", features: ROWS.map(r => r.elite) },
            ].map((tier, i) => (
              <article key={i} className="rounded-[var(--ff-radius-lg)] bg-[var(--ff-color-surface)] p-6 shadow-[var(--ff-shadow-soft)]">
                <div className="flex items-baseline justify-between">
                  <h2 className="font-heading text-xl">{tier.name}</h2>
                  <div className="text-2xl font-semibold">{tier.price}</div>
                </div>
                <ul className="mt-4 space-y-2">
                  {ROWS.map((row, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="mt-2 inline-block h-1.5 w-1.5 rounded-full bg-[var(--ff-color-primary-600)]" />
                      <span>{typeof tier.features[idx] === "boolean" ? (tier.features[idx] ? "Ja" : "Nee") : tier.features[idx]}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-5">
                  {i === 0 ? (
                    <a href="/results" className="ff-btn ff-btn-primary w-full">Start gratis</a>
                  ) : (
                    <button className="ff-btn ff-btn-secondary w-full" disabled>Beschikbaar zodra Plus live is</button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section ref={ref} className="ff-container py-10 sm:py-12">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: ShieldCheck, title: "Eerlijk", body: "Helder geprijsd, geen verborgen kosten of dark patterns." },
              { icon: UserCheck, title: "Persoonlijk", body: "Jouw stijl staat centraal; upgrades voegen alleen gemak toe." },
              { icon: LockKeyhole, title: "Privacy-first", body: "We verwerken alleen wat strikt nodig is voor jouw advies." },
            ].map((b, i) => (
              <div key={i} className="rounded-[var(--ff-radius-lg)] bg-[var(--ff-color-surface)] p-6 shadow-[var(--ff-shadow-soft)]">
                <div className="flex items-start gap-3">
                  <b.icon className="mt-0.5 h-5 w-5 text-[var(--ff-color-primary-600)]" aria-hidden />
                  <div>
                    <h3 className="font-heading text-lg">{b.title}</h3>
                    <p className="mt-1 text-[var(--ff-color-text)]/80">{b.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="ff-container py-10 sm:py-12">
          <h2 className="font-heading text-2xl">Veelgestelde vragen over prijzen</h2>
          <div className="mt-4 grid gap-4">
            {PRICE_FAQ.map((item, i) => (
              <details
                key={i}
                className="rounded-[var(--ff-radius-lg)] bg-[var(--ff-color-surface)] p-4 shadow-[var(--ff-shadow-soft)]"
              >
                <summary className="cursor-pointer font-heading text-[var(--ff-color-text)]">{item.q}</summary>
                <div className="mt-2 text-[var(--ff-color-text)]/80">{item.a}</div>
              </details>
            ))}
          </div>
        </section>

        <section className="ff-container py-10">
          <div className="flex flex-wrap gap-3">
            <a href="/results" className="ff-btn ff-btn-primary">Start gratis</a>
            <a href="/over-ons" className="ff-btn ff-btn-secondary">Waarom FitFi</a>
          </div>
        </section>
      </main>
    </>
  );
}