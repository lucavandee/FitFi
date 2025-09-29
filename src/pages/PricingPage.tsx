import React from "react";
import { Helmet } from "react-helmet-async";
import { NavLink } from "react-router-dom";
import PageHero from "@/components/marketing/PageHero";

type Plan = {
  id: "starter" | "pro" | "elite";
  title: string; tagline: string;
  monthly: number; yearly: number;
  features: string[]; ctaLabel: string; popular?: boolean;
};

const PLANS: Plan[] = [
  { id: "starter", title: "Starter", tagline: "Probeer rustig uit", monthly: 0, yearly: 0,
    features: ["3 outfits per maand", "Basis kleur- & silhouetadvies", "Wishlist (beperkt)"], ctaLabel: "Start gratis" },
  { id: "pro", title: "Pro", tagline: "Voor bewuste keuzes", monthly: 12, yearly: 9, popular: true,
    features: ["AI Style Scan", "10 outfits per maand", "Seizoensadvies", "Wishlist + alerts"], ctaLabel: "Ga voor Pro" },
  { id: "elite", title: "Elite", tagline: "Voor stijl-maximalisten", monthly: 24, yearly: 19,
    features: ["AI Style Scan (pro+)", "Onbeperkte outfits", "Premium support"], ctaLabel: "Ga voor Elite" }
];

function Price({ value }: { value: number }) {
  return value === 0
    ? <span className="text-3xl font-semibold">Gratis</span>
    : <span className="text-3xl font-semibold">€{value}<span className="text-sm font-normal text-[var(--color-text)]/70"> / maand</span></span>;
}

function PlanCard({ plan, yearly }: { plan: Plan; yearly: boolean; }) {
  return (
    <article className={`rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)] ${plan.popular ? "ring-1 ring-[var(--ff-color-primary-600)]" : ""}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="font-montserrat text-xl text-[var(--color-text)]">{plan.title}</div>
          <div className="text-[var(--color-text)]/80">{plan.tagline}</div>
        </div>
        <div className="text-[var(--color-text)]"><Price value={yearly ? plan.yearly : plan.monthly} /></div>
      </div>

      <ul className="mt-4 grid gap-2 text-[var(--color-text)]/90">
        {plan.features.map((f, i) => <li key={i} className="list-disc ml-5">{f}</li>)}
      </ul>

      <div className="mt-6">
        <NavLink to="/register" className="ff-btn ff-btn-primary">{plan.ctaLabel}</NavLink>
      </div>
    </article>
  );
}

export default function PricingPage() {
  const [yearly, setYearly] = React.useState(true);

  return (
    <>
      <Helmet>
        <title>Prijzen — FitFi</title>
        <meta name="description" content="Betaal wat bij je past — begin gratis en upgrade wanneer jij er klaar voor bent." />
        <link rel="canonical" href="https://fitfi.ai/prijzen" />
      </Helmet>

      <main id="main" className="bg-[var(--color-bg)] text-[var(--color-text)]">
        <PageHero
          id="page-pricing"
          eyebrow="PRIJZEN"
          title="Betaal wat bij je past"
          subtitle="Begin gratis. Kies een pakket pas wanneer je zeker weet dat het bij je past."
          align="left"
          as="h1"
          size="sm"
          ctas={[
            { label: "Probeer gratis", to: "/results", variant: "primary", "data-event": "cta_pricing_try" },
            { label: "Veelgestelde vragen", to: "/veelgestelde-vragen", variant: "secondary", "data-event": "cta_pricing_faq" }
          ]}
          note="Je kunt op elk moment opzeggen."
        />

        <section className="ff-container ff-stack-lg py-10 sm:py-12">
          <div className="inline-flex items-center gap-2 text-sm text-[var(--color-text)]/70 mb-4" role="group" aria-label="Prijsperiode">
            <button type="button" aria-pressed={yearly} onClick={() => setYearly(true)} className="ff-btn ff-btn-secondary">Jaar</button>
            <button type="button" aria-pressed={!yearly} onClick={() => setYearly(false)} className="ff-btn ff-btn-secondary">Maand</button>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {PLANS.map((p) => <PlanCard key={p.id} plan={p} yearly={yearly} />)}
          </div>

          <div className="mt-8 flex gap-3">
            <NavLink to="/register" className="ff-btn ff-btn-primary">Start nu</NavLink>
            <NavLink to="/hoe-het-werkt" className="ff-btn ff-btn-secondary">Hoe het werkt</NavLink>
          </div>
        </section>
      </main>
    </>
  );
}