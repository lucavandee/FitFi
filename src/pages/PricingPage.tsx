// src/pages/PricingPage.tsx
import React from "react";
import { NavLink } from "react-router-dom";

/**
 * PricingPage — tokens-first + ff-utilities, zonder nieuwe imports/routes.
 * - Inline "componentjes" (PlanCard, FAQ) zodat we geen extra imports nodig hebben.
 * - AA-contrast via tokens; CTA-regels toegepast (primary/secondary).
 * - Geen #hex in deze file (alle kleuren via tokens of ff-utilities).
 */

type Plan = {
  id: "starter" | "pro" | "elite";
  title: string;
  tagline: string;
  monthly: number; // in EUR
  yearly: number;  // in EUR (per maand, gefactureerd per jaar)
  features: string[];
  ctaLabel: string;
  popular?: boolean;
};

const PLANS: Plan[] = [
  {
    id: "starter",
    title: "Starter",
    tagline: "Perfect om te beginnen",
    monthly: 0,
    yearly: 0,
    features: [
      "AI Style Scan (basis)",
      "3 outfit-suggesties p/mnd",
      "Favorietenlijst",
      "E-mail support (basis)",
    ],
    ctaLabel: "Start gratis",
  },
  {
    id: "pro",
    title: "Pro",
    tagline: "Meest gekozen",
    monthly: 12,
    yearly: 9, // p/mnd bij jaarbetaling
    features: [
      "AI Style Scan (geavanceerd)",
      "10 outfit-suggesties p/mnd",
      "Persoonlijke stijlnotities",
      "Shoplinks & prijsalerts",
      "Prioritaire support",
    ],
    ctaLabel: "Proberen",
    popular: true,
  },
  {
    id: "elite",
    title: "Elite",
    tagline: "Voor stijl maximalisten",
    monthly: 24,
    yearly: 19, // p/mnd bij jaarbetaling
    features: [
      "AI Style Scan (pro+)",
      "Onbeperkte outfits",
      "Seizoenscapsules & wishlist",
      "Kleur- & silhouetadvies",
      "Premium support",
    ],
    ctaLabel: "Ga voor Elite",
  },
];

function Price({ value }: { value: number }) {
  if (value === 0) {
    return <span className="text-3xl font-semibold">Gratis</span>;
  }
  return (
    <span className="text-3xl font-semibold">
      €{value}
      <span className="text-sm font-normal text-text/70"> / maand</span>
    </span>
  );
}

function PlanCard({
  plan,
  yearlyBilling,
}: {
  plan: Plan;
  yearlyBilling: boolean;
}) {
  const price = yearlyBilling ? plan.yearly : plan.monthly;

  return (
    <article
      className={[
        "ff-card overflow-hidden flex flex-col",
        plan.popular ? "outline outline-1 outline-[color:color-mix(in_oklab,var(--ff-color-primary-700) 22%,var(--color-border))]" : "",
      ].join(" ")}
      aria-labelledby={`${plan.id}-title`}
    >
      {/* Popular badge */}
      {plan.popular && (
        <div className="px-4 py-2">
          <span className="ff-chip ff-chip--active text-xs">Meest gekozen</span>
        </div>
      )}

      <div className="p-5 sm:p-6 grow">
        <h3 id={`${plan.id}-title`} className="font-heading text-xl leading-tight">
          {plan.title}
        </h3>
        <p className="mt-1 text-text/80">{plan.tagline}</p>

        <div className="mt-4">
          <Price value={price} />
          {yearlyBilling && plan.monthly > 0 && (
            <div className="text-xs text-text/70 mt-1">
              Gefactureerd jaarlijks • Bespaar t.o.v. maandelijks
            </div>
          )}
        </div>

        <ul className="mt-4 space-y-2 text-sm">
          {plan.features.map((f, i) => (
            <li key={i} className="flex items-start gap-2">
              <span aria-hidden="true" className="mt-[2px] ff-chip text-[10px] leading-none">✓</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-5 sm:p-6 pt-0">
        <div className="flex flex-col sm:flex-row gap-2">
          <NavLink
            to="/hoe-het-werkt"
            className="ff-btn ff-btn-primary h-10"
            aria-label={`${plan.ctaLabel} – ${plan.title}`}
          >
            {plan.ctaLabel}
          </NavLink>
          <NavLink to="/hoe-het-werkt" className="ff-btn ff-btn-secondary h-10">
            Bekijk features
          </NavLink>
        </div>
      </div>
    </article>
  );
}

function FAQ() {
  return (
    <section aria-labelledby="faq-title" className="mt-10 sm:mt-14">
      <h2 id="faq-title" className="font-heading text-xl sm:text-2xl">
        Veelgestelde vragen
      </h2>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <details className="ff-card p-4">
          <summary className="cursor-pointer font-medium">Kan ik eerst gratis proberen?</summary>
          <p className="mt-2 text-sm text-text/80">
            Ja. Met <strong>Starter</strong> kun je direct gratis beginnen. Wil je meer outfits en functies, kies dan voor Pro of Elite — je kunt altijd downgraden of annuleren.
          </p>
        </details>
        <details className="ff-card p-4">
          <summary className="cursor-pointer font-medium">Wat betekent "jaarlijks gefactureerd"?</summary>
          <p className="mt-2 text-sm text-text/80">
            Bij jaarlijkse betaling betaal je één bedrag vooruit voor 12 maanden. De maandprijs is dan lager dan bij maandelijkse betaling.
          </p>
        </details>
        <details className="ff-card p-4">
          <summary className="cursor-pointer font-medium">Hoe werken shoplinks en prijsalerts?</summary>
          <p className="mt-2 text-sm text-text/80">
            Bij passende items tonen we shoplinks (partners). Als je alerts inschakelt, geven we je een seintje bij prijsdalingen of voorraad.
          </p>
        </details>
        <details className="ff-card p-4">
          <summary className="cursor-pointer font-medium">Kan ik op elk moment opzeggen?</summary>
          <p className="mt-2 text-sm text-text/80">
            Ja. Maandabonnementen kun je maandelijks opzeggen. Jaarabonnementen lopen tot het einde van de periode en verlengen niet automatisch zonder bevestiging.
          </p>
        </details>
      </div>
    </section>
  );
}

export default function PricingPage() {
  const [yearly, setYearly] = React.useState<boolean>(false);

  return (
    <main id="main" className="bg-surface text-text">
      <section aria-labelledby="pricing-title" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <header>
          <p className="text-sm text-text/70">Simpel & eerlijk</p>
          <h1 id="pricing-title" className="font-heading text-2xl sm:text-3xl ff-text-balance">
            Kies jouw plan
          </h1>
          <p className="mt-2 text-text/80">
            Betaal maandelijks of bespaar met jaarbetaling. Upgrade/downgrade wanneer je wilt.
          </p>
        </header>

        {/* Billing toggle (toegankelijk) */}
        <div className="mt-5">
          <div
            role="group"
            aria-label="Facturatieperiode"
            className="inline-flex items-center gap-2 ff-card p-1"
          >
            <button
              type="button"
              className={[
                "ff-btn h-9 px-3",
                yearly ? "ff-btn-secondary" : "ff-btn-primary",
              ].join(" ")}
              aria-pressed={!yearly}
              onClick={() => setYearly(false)}
            >
              Maandelijks
            </button>
            <button
              type="button"
              className={[
                "ff-btn h-9 px-3",
                yearly ? "ff-btn-primary" : "ff-btn-secondary",
              ].join(" ")}
              aria-pressed={yearly}
              onClick={() => setYearly(true)}
            >
              Jaarlijks
            </button>
          </div>
          <div className="text-xs text-text/70 mt-2">
            Prijzen in EUR, incl. btw waar van toepassing.
          </div>
        </div>

        {/* Plans */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {PLANS.map((p) => (
            <PlanCard key={p.id} plan={p} yearlyBilling={yearly} />
          ))}
        </div>

        {/* Guarantees */}
        <section aria-labelledby="guarantees-title" className="mt-8 sm:mt-10">
          <h2 id="guarantees-title" className="sr-only">Zekerheden</h2>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <li className="ff-card p-4">
              <p className="font-medium">Privacy-first</p>
              <p className="text-sm text-text/80">Wij gebruiken jouw antwoorden uitsluitend om jouw stijl te personaliseren.</p>
            </li>
            <li className="ff-card p-4">
              <p className="font-medium">Altijd aanpasbaar</p>
              <p className="text-sm text-text/80">Upgrade of downgrade wanneer je wilt — zonder gedoe.</p>
            </li>
            <li className="ff-card p-4">
              <p className="font-medium">Heldere prijzen</p>
              <p className="text-sm text-text/80">Geen verborgen kosten; je ziet altijd vooraf wat je betaalt.</p>
            </li>
          </ul>
        </section>

        {/* CTA strip */}
        <section aria-labelledby="cta-strip-title" className="mt-8 sm:mt-10 ff-glass p-4 sm:p-5">
          <h2 id="cta-strip-title" className="sr-only">Aan de slag</h2>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="font-heading text-lg">Klaar om je stijl te upgraden?</p>
              <p className="text-sm text-text/80">
                Start gratis en ontvang direct je AI Style Report met outfits en shoplinks.
              </p>
            </div>
            <div className="flex gap-2">
              <NavLink to="/hoe-het-werkt" className="ff-btn ff-btn-primary h-10">Start gratis</NavLink>
              <NavLink to="/veelgestelde-vragen" className="ff-btn ff-btn-secondary h-10">FAQ</NavLink>
            </div>
          </div>
        </section>

        <FAQ />
      </section>
    </main>
  );
}