import React from "react";
import { Helmet } from "react-helmet-async";
import PageHero from "@/components/marketing/PageHero";

type QA = { q: string; a: string; cat: "Account & betalingen" | "Quiz & profiel" | "Outfits & styling" | "Privacy & data" };

const QAS: QA[] = [
  // Account & betalingen
  { cat: "Account & betalingen", q: "Kan ik op elk moment opzeggen?", a: "Ja. Je regelt dit in je account; de opzegging gaat per einde termijn in." },
  { cat: "Account & betalingen", q: "Welke betaalmethoden accepteren jullie?", a: "We ondersteunen gangbare methoden (o.a. iDEAL/kaart). Exacte opties zie je bij afrekenen." },
  { cat: "Account & betalingen", q: "Krijg ik facturen?", a: "Ja, facturen zijn automatisch beschikbaar om te downloaden." },

  // Quiz & profiel
  { cat: "Quiz & profiel", q: "Hoe lang duurt de quiz?", a: "Gemiddeld twee minuten. Je kunt later je profiel verfijnen." },
  { cat: "Quiz & profiel", q: "Kan ik mijn antwoorden aanpassen?", a: "Ja. Je kunt je profiel bewerken en outfits opnieuw genereren." },
  { cat: "Quiz & profiel", q: "Werkt het ook met mijn huidige garderobe?", a: "Ja. Je kunt items bewaren, combineren en prijsalerts instellen." },

  // Outfits & styling
  { cat: "Outfits & styling", q: "Krijg ik uitleg waarom iets bij me past?", a: "Ja. Elke outfit bevat een korte redenatie (silhouet & kleur)." },
  { cat: "Outfits & styling", q: "Zijn outfits seizoensgebonden?", a: "We nemen seizoenen mee, zodat je outfits aansluiten op het weer en je agenda." },

  // Privacy & data
  { cat: "Privacy & data", q: "Verkopen jullie data?", a: "Nee. We minimaliseren data en verkopen niets door—privacy-first." },
  { cat: "Privacy & data", q: "Welke data bewaren jullie?", a: "Alleen wat nodig is om je profiel en outfits te leveren. Je kunt data exporteren of verwijderen." },
];

export default function FAQPage() {
  const [query, setQuery] = React.useState("");

  const cats = Array.from(new Set(QAS.map(q => q.cat)));
  const filtered = QAS.filter(item => {
    if (!query.trim()) return true;
    const q = (item.q + " " + item.a).toLowerCase();
    return q.includes(query.toLowerCase());
  });

  return (
    <>
      <Helmet>
        <title>Veelgestelde vragen — FitFi</title>
        <link rel="canonical" href="https://fitfi.ai/veelgestelde-vragen" />
      </Helmet>

      <main id="main" className="bg-[var(--color-bg)] text-[var(--color-text)]">
        <PageHero
          id="page-faq"
          eyebrow="FAQ"
          title="Veelgestelde vragen"
          subtitle="Vind snel het antwoord of stel je vraag—we helpen je graag."
          align="left"
          as="h1"
          size="sm"
          ctas={[
            { label: "Stel je vraag", to: "/contact", variant: "primary" },
            { label: "Start gratis", to: "/results", variant: "secondary" }
          ]}
        />

        <section className="ff-container py-6 sm:py-8">
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            <label htmlFor="faq-search" className="block text-sm text-[var(--color-text)]/70 mb-1">Zoek in de FAQ</label>
            <input
              id="faq-search"
              type="search"
              className="w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 outline-none"
              placeholder="Bijvoorbeeld: opzeggen, betaalmethoden, outfits…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Zoek in de FAQ"
            />
          </div>
        </section>

        {cats.map((cat) => (
          <section key={cat} className="ff-container py-4 sm:py-6">
            <h2 className="font-montserrat text-xl sm:text-2xl mb-3">{cat}</h2>
            <div className="grid gap-3">
              {filtered.filter(f => f.cat === cat).length === 0 ? (
                <p className="text-[var(--color-text)]/70">Geen resultaten in deze categorie.</p>
              ) : (
                filtered.filter(f => f.cat === cat).map((item, i) => (
                  <details key={i} className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                    <summary className="cursor-pointer font-montserrat">{item.q}</summary>
                    <p className="mt-2 text-[var(--color-text)]/80">{item.a}</p>
                  </details>
                ))
              )}
            </div>
          </section>
        ))}

        <section className="ff-container py-8">
          <div className="flex gap-3">
            <a href="mailto:support@fitfi.ai" className="ff-btn ff-btn-secondary">Mail support</a>
            <a href="/results" className="ff-btn ff-btn-primary">Start gratis</a>
          </div>
        </section>
      </main>
    </>
  );
}