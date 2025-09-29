import React from "react";
import { Helmet } from "react-helmet-async";
import { NavLink } from "react-router-dom";
import PageHero from "@/components/marketing/PageHero";

function Check(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" {...props}>
      <path d="M5 13l4 4L19 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function Dash(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" {...props}>
      <path d="M5 12h14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

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

const PRICE_FAQ = [
  { q: "Kan ik op elk moment opzeggen?", a: "Ja. Maandabonnementen kun je op elk moment opzeggen in je account." },
  { q: "Welke betaalmethoden accepteren jullie?", a: "De bekendste methoden worden ondersteund (o.a. iDEAL/kaart); exacte opties zie je bij het afrekenen." },
  { q: "Krijg ik een factuur?", a: "Ja, je ontvangt automatisch facturen die je kunt downloaden." },
  { q: "Wat gebeurt er na de proefperiode?", a: "Je blijft in Starter of kiest zelf een betaald plan—geen automatische verrassingen." },
];

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
            { label: "Probeer gratis", to: "/results", variant: "primary" },
            { label: "Veelgestelde vragen", to: "#pricing-faq", variant: "secondary" }
          ]}
          note="Je kunt op elk moment opzeggen."
        />

        {/* Prijsperiode + kaarten */}
        <section className="ff-container ff-stack-lg py-10 sm:py-12">
          <div className="inline-flex items-center gap-2 text-sm text-[var(--color-text)]/70 mb-4" role="group" aria-label="Prijsperiode">
            <button type="button" aria-pressed={yearly} onClick={() => setYearly(true)} className="ff-btn ff-btn-secondary">Jaar</button>
            <button type="button" aria-pressed={!yearly} onClick={() => setYearly(false)} className="ff-btn ff-btn-secondary">Maand</button>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {PLANS.map((p) => <PlanCard key={p.id} plan={p} yearly={yearly} />)}
          </div>
        </section>

        {/* Vergelijkende tabel */}
        <section className="ff-container py-8 sm:py-12">
          <header className="mb-4 sm:mb-6">
            <h2 className="font-montserrat text-2xl sm:text-3xl">Vergelijk plannen</h2>
            <p className="text-[var(--color-text)]/80 mt-2">Zie in één oogopslag wat je krijgt in Starter, Pro en Elite.</p>
          </header>

          <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)]">
            <table className="min-w-[720px] w-full text-sm">
              <thead className="text-left border-b border-[var(--color-border)]">
                <tr>
                  <th className="p-4">Feature</th>
                  <th className="p-4">Starter</th>
                  <th className="p-4">Pro</th>
                  <th className="p-4">Elite</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Outfits per maand", "3", "10", "Onbeperkt"],
                  ["AI Style Scan", <Check key="s1"/>, <Check key="p1"/>, <Check key="e1"/>],
                  ["Seizoensadvies", <Dash key="s2"/>, <Check key="p2"/>, <Check key="e2"/>],
                  ["Wishlist + prijsalerts", <Dash key="s3"/>, <Check key="p3"/>, <Check key="e3"/>],
                  ["Premium support", <Dash key="s4"/>, <Dash key="p4"/>, <Check key="e4"/>],
                ].map((row, idx) => (
                  <tr key={idx} className="border-b border-[var(--color-border)] last:border-0">
                    <td className="p-4 font-medium">{row[0] as string}</td>
                    <td className="p-4">{row[1] as React.ReactNode}</td>
                    <td className="p-4">{row[2] as React.ReactNode}</td>
                    <td className="p-4">{row[3] as React.ReactNode}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Garantie & veiligheid */}
        <section className="ff-container py-6 sm:py-10">
          <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
            {[
              { t: "Opzeggen wanneer jij wilt", d: "Geen kleine lettertjes. Je regelt alles zelf in je account." },
              { t: "Privacy-first", d: "We minimaliseren data en verkopen niets door. AVG-proof." },
              { t: "Eerlijke aanbevelingen", d: "Affiliate-links kunnen voorkomen, het advies blijft stijl-gedreven." },
            ].map((c, i) => (
              <article key={i} className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-soft)]">
                <h3 className="font-montserrat text-lg">{c.t}</h3>
                <p className="text-[var(--color-text)]/80 mt-1">{c.d}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Prijs FAQ */}
        <section id="pricing-faq" className="ff-container py-8 sm:py-12">
          <header className="mb-4 sm:mb-6">
            <h2 className="font-montserrat text-2xl sm:text-3xl">Veelgestelde vragen over prijzen</h2>
          </header>
          <div className="grid gap-3">
            {PRICE_FAQ.map((item, i) => (
              <details key={i} className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                <summary className="cursor-pointer font-montserrat">{item.q}</summary>
                <p className="mt-2 text-[var(--color-text)]/80">{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}