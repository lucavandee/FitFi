import React from "react";
import { Helmet } from "react-helmet-async";
import PageHero from "@/components/marketing/PageHero";
import { NavLink } from "react-router-dom";

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
    features: ["AI Style Scan", "10 outfits per maand", "Seizoens-advies", "Wishlist + alerts"], ctaLabel: "Ga voor Pro" },
  { id: "elite", title: "Elite", tagline: "Voor stijl maximalisten", monthly: 24, yearly: 19,
    features: ["AI Style Scan (pro+)", "Onbeperkte outfits", "Premium support"], ctaLabel: "Ga voor Elite" }
];

function Price({ value }: { value: number }) {
  return value === 0
    ? <span className="text-3xl font-semibold">Gratis</span>
    : <span className="text-3xl font-semibold">€{value}<span className="text-sm font-normal text-text/70"> / maand</span></span>;
}

function PlanCard({ plan, yearly }: { plan: Plan; yearly: boolean; }) {
  return (
    <div className={`ff-price-card${plan.popular ? " is-featured" : ""}`}>
      <div className="ff-price-header">
        <div>
          <div className="ff-price-name">{plan.title}</div>
          <div className="text-text/70">{plan.tagline}</div>
        </div>
        <div className="ff-price-value"><Price value={yearly ? plan.yearly : plan.monthly} /></div>
      </div>

      <ul className="ff-price-features">
        {plan.features.map((f, i) => <li key={i}>{f}</li>)}
      </ul>

      <div className="ff-price-cta">
        <NavLink to="/register" className="ff-btn ff-btn-primary">{plan.ctaLabel}</NavLink>
      </div>
    </div>
  );
}

export default function PricingPage() {
  const [yearly, setYearly] = React.useState(true);

  return (
    <>
      <Helmet>
        <title>Prijzen — FitFi</title>
        <meta name="description" content="Betaal wat bij je past — van gratis starten tot premium opties wanneer jij er klaar voor bent." />
        <link rel="canonical" href="https://fitfi.ai/prijzen" />
      </Helmet>

      <main id="main" className="bg-bg text-text">
        <PageHero
          id="page-pricing"
          eyebrow="PRIJZEN"
          title="Betaal wat bij je past"
          subtitle="Een gratis start, plus premium opties wanneer jij er klaar voor bent."
          align="left"
          as="h1"
          size="sm"
        />

        <section className="ff-container ff-stack-lg py-10 sm:py-12">
          <div className="ff-pill-switch" role="group" aria-label="Prijsperiode">
            <button type="button" aria-pressed={yearly} onClick={() => setYearly(true)}>Jaar</button>
            <button type="button" aria-pressed={!yearly} onClick={() => setYearly(false)}>Maand</button>
          </div>

          <div className="ff-price-grid">
            {PLANS.map((p) => <PlanCard key={p.id} plan={p} yearly={yearly} />)}
          </div>
        </section>

        <section className="ff-container">
          <div className="cta-row">
            <NavLink to="/register" className="ff-btn ff-btn-primary">Start gratis</NavLink>
            <NavLink to="/veelgestelde-vragen" className="ff-btn ff-btn-secondary">FAQ</NavLink>
          </div>
        </section>
      </main>
    </>
  );
}