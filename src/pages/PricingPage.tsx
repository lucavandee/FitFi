import React from "react";
import { Helmet } from "react-helmet-async";
import PageHero from "@/components/marketing/PageHero";
import { useFadeInOnVisible } from "@/hooks/useFadeInOnVisible";
import { ShieldCheck, UserCheck, LockKeyhole, CheckCircle2 } from "lucide-react";

type Row = { label: string; starter: boolean | string; pro: boolean | string; elite: boolean | string; };

const ROWS: Row[] = [
  { label: "Outfits per maand", starter: "3", pro: "10", elite: "Onbeperkt" },
  { label: "AI‑analyse", starter: true, pro: true, elite: "Uitgebreid" },
  { label: "Wishlist", starter: "Beperkt", pro: "Volledig", elite: "Volledig + alerts" },
  { label: "Support", starter: "Basis", pro: "Sneller", elite: "Prioriteit" },
];

const PRICE_FAQ = [
  { q: "Kan ik op elk moment opzeggen?", a: "Ja. Je zit nergens aan vast en kunt maandelijks opzeggen." },
  { q: "Welke betaalmethodes accepteren jullie?", a: "We ondersteunen de gebruikelijke betaalmethoden. Je kunt eenvoudig betalen zoals je gewend bent." },
  { q: "Kan ik wisselen tussen maand en jaar?", a: "Ja. Je kunt altijd switchen; we verrekenen het verschil netjes." },
  { q: "Is er een gratis optie?", a: "Ja. Je kunt gratis starten met Starter en later upgraden." },
];

function Cell({ v }: { v: boolean | string }) {
  if (typeof v === "boolean") {
    return <span aria-label={v ? "Ja" : "Nee"}>{v ? "✓" : "—"}</span>;
  }
  return <span>{v}</span>;
}

// Definitie van de abonnementen om plan-kaarten te renderen. Iedere
// entry bevat de naam, prijs (per jaar en per maand), een korte
// omschrijving, featurelijst en een vlag of het plan "meest populair" is.
const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: { yearly: 0, monthly: 0 },
    description: "Voor wie wil kennismaken",
    features: [
      "3 outfits per maand",
      "AI‑analyse",
      "Wishlist beperkt",
      "Basis support",
    ],
    cta: { label: "Start gratis", to: "/results" },
    popular: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: { yearly: 9, monthly: 12 },
    description: "Voor frequente stijladviezen",
    features: [
      "10 outfits per maand",
      "AI‑analyse",
      "Wishlist volledig",
      "Sneller support",
    ],
    cta: { label: "Start met Pro", to: "/results" },
    popular: true,
  },
  {
    id: "elite",
    name: "Elite",
    price: { yearly: 19, monthly: 24 },
    description: "Voor onbeperkte inspiratie",
    features: [
      "Onbeperkt outfits",
      "AI‑analyse uitgebreid",
      "Wishlist alerts",
      "Prioriteit support",
    ],
    cta: { label: "Word Elite", to: "/results" },
    popular: false,
  },
] as const;

export default function PricingPage() {
  const [yearly, setYearly] = React.useState(true);

  return (
    <>
      <Helmet>
        <title>Prijzen — FitFi</title>
        <meta name="description" content="Betaal wat bij je past — begin gratis en upgrade wanneer jij er klaar voor bent." />
        <link rel="canonical" href="https://fitfi.ai/prijzen" />
      </Helmet>

      <main id="main" className="bg-[var(--ff-color-bg)] text-[var(--ff-color-text)]">
        <PageHero
          id="page-pricing"
          eyebrow="PRIJZEN"
          title="Betaal wat bij je past"
          subtitle="Begin gratis. Upgrade pas als je voelt dat het klopt."
          align="left"
          as="h1"
          size="sm"
          ctas={[
            { label: "Probeer gratis", to: "/results", variant: "primary" },
            { label: "Veelgestelde vragen", to: "#price-faq", variant: "secondary" }
          ]}
          note="Jaar is voordeliger. Opzeggen kan altijd."
        />

        <section className="ff-container py-8">
          <div role="group" aria-label="Prijsperiode" className="inline-flex gap-2">
            <button className="ff-btn ff-btn-secondary" aria-pressed={yearly} onClick={() => setYearly(true)}>Jaar</button>
            <button className="ff-btn ff-btn-secondary" aria-pressed={!yearly} onClick={() => setYearly(false)}>Maand</button>
          </div>
        </section>

        <section className="ff-container py-6">
          {/* Visueel aantrekkelijke kaartweergave van de abonnementen */}
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
                    "flex flex-col rounded-[var(--ff-radius-lg)] border p-6 shadow-[var(--ff-shadow-soft)]",
                    plan.popular ? "border-[var(--ff-color-accent)] bg-[color-mix(in oklab, var(--ff-color-accent) 5%, var(--ff-color-surface))]" : "border-[var(--ff-color-border)] bg-[var(--ff-color-surface)]",
                  ].join(" ")}
                >
                  {plan.popular && (
                    <span className="mb-2 inline-block rounded-full bg-[var(--ff-color-accent)]/10 px-3 py-1 text-xs font-semibold text-[var(--ff-color-accent)]">
                      Meest gekozen
                    </span>
                  )}
                  <h3 className="font-heading text-xl text-[var(--ff-color-text)]">{plan.name}</h3>
                  <p className="mt-1 text-[var(--ff-color-text)]/70">{plan.description}</p>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-[var(--ff-color-text)]">
                      €{price}
                    </span>
                    <span className="text-[var(--ff-color-text)]/70">{period}</span>
                    {price === 0 && (
                      <span className="ml-1 text-sm text-[var(--ff-color-text)]/70">Gratis</span>
                    )}
                  </div>
                    <ul className="mt-4 space-y-2 text-[var(--ff-color-text)]/80">
                    {plan.features.map((f, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 size={16} className="text-[var(--ff-color-accent)] mt-[2px]" aria-hidden />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6">
                    <a
                      href={plan.cta.to}
                      className={[
                        "ff-btn h-10 w-full",
                        plan.popular ? "ff-btn-primary" : "ff-btn-secondary",
                      ].join(" ")}
                    >
                      {plan.cta.label}
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Oudere tabelweergave blijft toegankelijk voor schermlezers */}
          <div className="sr-only">
            <table className="w-full text-left">
              <thead className="text-[var(--ff-color-text)]/70">
                <tr>
                  <th className="p-4">Functie</th>
                  <th className="p-4">Starter {yearly ? "€0/jr" : "€0/mnd"}</th>
                  <th className="p-4">Pro {yearly ? "€9/jr" : "€12/mnd"}</th>
                  <th className="p-4">Elite {yearly ? "€19/jr" : "€24/mnd"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--ff-color-border)]">
                {ROWS.map((r, i) => (
                  <tr key={i}>
                    <td className="p-4 text-[var(--ff-color-text)]">{r.label}</td>
                    <td className="p-4"><Cell v={r.starter} /></td>
                    <td className="p-4"><Cell v={r.pro} /></td>
                    <td className="p-4"><Cell v={r.elite} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="ff-container py-10">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: UserCheck,
                title: "Opzeggen kan altijd",
                desc: "Geen kleine lettertjes. Je zit nergens aan vast.",
              },
              {
                icon: ShieldCheck,
                title: "Privacy staat voorop",
                desc: "We gaan zorgvuldig om met je data en verkopen niets door.",
              },
              {
                icon: LockKeyhole,
                title: "Veilige betalingen",
                desc: "Afrekenen gaat via betrouwbare betaalpartners, zoals je gewend bent.",
              },
            ].map((feat, idx) => {
              const { ref, visible } = useFadeInOnVisible<HTMLDivElement>();
              const Icon = feat.icon;
              return (
                <article
                  key={idx}
                  ref={ref as any}
                  style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? "translateY(0)" : "translateY(12px)",
                    transition: "opacity 600ms ease, transform 600ms ease",
                  }}
                  // Gebruik enkel een zachte achtergrond en schaduw, zonder border.
                  className="rounded-[var(--ff-radius-lg)] bg-[var(--ff-color-surface)] p-6 shadow-[var(--ff-shadow-soft)]"
                >
                  <Icon size={24} className="text-[var(--ff-color-accent)]" aria-hidden />
                  <h3 className="mt-3 font-heading text-lg text-[var(--ff-color-text)]">{feat.title}</h3>
                  <p className="mt-2 text-[var(--ff-color-text)]/80">{feat.desc}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section id="price-faq" className="ff-container py-8">
          <h2 className="font-heading text-2xl text-[var(--ff-color-text)] mb-4">Veelgestelde prijs-vragen</h2>
          <div className="grid gap-3">
            {PRICE_FAQ.map((item, i) => (
              <details
                key={i}
                // Zachte achtergrond en schaduw in plaats van border voor een premium gevoel.
                className="rounded-[var(--ff-radius-lg)] bg-[var(--ff-color-surface)] p-4 shadow-[var(--ff-shadow-soft)]"
              >
                <summary className="cursor-pointer font-heading text-[var(--ff-color-text)]">{item.q}</summary>
                <div className="mt-2 text-[var(--ff-color-text)]/80">{item.a}</div>
              </details>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}