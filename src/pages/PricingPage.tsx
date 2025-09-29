import React from "react";
import { Helmet } from "react-helmet-async";
import PageHero from "@/components/marketing/PageHero";

type Row = { label: string; starter: boolean | string; pro: boolean | string; elite: boolean | string; };

const ROWS: Row[] = [
  { label: "Outfits per maand", starter: "3", pro: "10", elite: "Onbeperkt" },
  { label: "AI-style analyse", starter: true, pro: true, elite: "Uitgebreid" },
  { label: "Wishlist", starter: "Beperkt", pro: "Volledig", elite: "Volledig + alerts" },
  { label: "Support", starter: "Basis", pro: "Sneller", elite: "Prioriteit" },
];

const PRICE_FAQ = [
  { q: "Kan ik op elk moment opzeggen?", a: "Ja. Je zit nergens aan vast en kunt maandelijks opzeggen." },
  { q: "Welke betaalmethodes zijn er?", a: "Gangbare betaalmethodes, afhankelijk van je land. We maken het zo makkelijk mogelijk." },
  { q: "Kan ik wisselen tussen maand en jaar?", a: "Ja. Wisselen kan; we verrekenen netjes." },
  { q: "Is er een gratis optie?", a: "Ja. Je kunt gratis starten met Starter en later upgraden." },
];

function Cell({ v }: { v: boolean | string }) {
  if (typeof v === "boolean") {
    return <span aria-label={v ? "Ja" : "Nee"}>{v ? "✓" : "—"}</span>;
  }
  return <span>{v}</span>;
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
          subtitle="Begin gratis. Upgrade pas als je voelt dat het klopt."
          align="left"
          as="h1"
          size="sm"
          ctas={[
            { label: "Probeer gratis", to: "/results", variant: "primary" },
            { label: "Veelgestelde vragen", to: "#price-faq", variant: "secondary" }
          ]}
          note="Jaar = voordeliger. Opzeggen kan altijd."
        />

        {/* Periode-schakelaar (jaar/maand) */}
        <section className="ff-container py-8">
          <div role="group" aria-label="Prijsperiode" className="inline-flex gap-2">
            <button className="ff-btn ff-btn-secondary" aria-pressed={yearly} onClick={() => setYearly(true)}>Jaar</button>
            <button className="ff-btn ff-btn-secondary" aria-pressed={!yearly} onClick={() => setYearly(false)}>Maand</button>
          </div>
        </section>

        {/* Vergelijkingstabel */}
        <section className="ff-container py-6">
          <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-soft)]">
            <table className="w-full text-left">
              <thead className="text-[var(--color-text)]/70">
                <tr>
                  <th className="p-4">Functie</th>
                  <th className="p-4">Starter {yearly ? "€0/jr" : "€0/mnd"}</th>
                  <th className="p-4">Pro {yearly ? "€9/jr" : "€12/mnd"}</th>
                  <th className="p-4">Elite {yearly ? "€19/jr" : "€24/mnd"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {ROWS.map((r, i) => (
                  <tr key={i}>
                    <td className="p-4 text-[var(--color-text)]">{r.label}</td>
                    <td className="p-4"><Cell v={r.starter} /></td>
                    <td className="p-4"><Cell v={r.pro} /></td>
                    <td className="p-4"><Cell v={r.elite} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex gap-3">
            <a href="/results" className="ff-btn ff-btn-primary">Start nu</a>
            <a href="/hoe-het-werkt" className="ff-btn ff-btn-secondary">Hoe het werkt</a>
          </div>
        </section>

        {/* Garantie & veiligheid */}
        <section className="ff-container py-10">
          <div className="grid gap-6 md:grid-cols-3">
            <article className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)]">
              <h3 className="font-montserrat text-lg text-[var(--color-text)]">Opzeggen kan altijd</h3>
              <p className="mt-2 text-[var(--color-text)]/80">Geen kleine lettertjes. Je zit nergens aan vast.</p>
            </article>
            <article className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)]">
              <h3 className="font-montserrat text-lg text-[var(--color-text)]">Privacy-first</h3>
              <p className="mt-2 text-[var(--color-text)]/80">We doen netjes met data. Zo min mogelijk verzamelen, niet doorverkopen.</p>
            </article>
            <article className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)]">
              <h3 className="font-montserrat text-lg text-[var(--color-text)]">Veilig betalen</h3>
              <p className="mt-2 text-[var(--color-text)]/80">Betrouwbare providers en versleuteling. Gewoon zoals het hoort.</p>
            </article>
          </div>
        </section>

        {/* FAQ prijs */}
        <section id="price-faq" className="ff-container py-8">
          <h2 className="font-montserrat text-2xl text-[var(--color-text)] mb-4">Veelgestelde prijs-vragen</h2>
          <div className="grid gap-3">
            {PRICE_FAQ.map((item, i) => (
              <details key={i} className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                <summary className="cursor-pointer font-montserrat text-[var(--color-text)]">{item.q}</summary>
                <div className="mt-2 text-[var(--color-text)]/80">{item.a}</div>
              </details>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}