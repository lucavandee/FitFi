import React from "react";
import { Helmet } from "react-helmet-async";
import PageHero from "@/components/marketing/PageHero";

type QA = { q: string; a: string; };
const ACCOUNT: QA[] = [
  { q: "Hoe maak ik een account?", a: "Start met de scan. Je kunt daarna een account aanmaken om je profiel te bewaren." },
  { q: "Hoe zeg ik op?", a: "In je account kun je op elk moment opzeggen. Het is zo geregeld." },
  { q: "Kan ik mijn e-mail aanpassen?", a: "Ja. In je profiel kun je je gegevens wijzigen." },
];
const QUIZ: QA[] = [
  { q: "Hoe lang duurt de scan?", a: "Ongeveer twee minuten. Zes korte vragen." },
  { q: "Wat als ik twijfels heb over een vraag?", a: "Ga op gevoel. Je kunt later altijd bijsturen." },
  { q: "Krijg ik direct outfits?", a: "Ja. Je ziet meteen voorbeelden per gelegenheid." },
];
const OUTFITS: QA[] = [
  { q: "Werken outfits ook voor verschillende budgetten?", a: "Ja. Je krijgt richtlijnen die je zelf kunt vertalen naar je favoriete winkels." },
  { q: "Kan ik items bewaren?", a: "Ja, met Wishlist. In Pro en Elite kun je alerts instellen." },
];
const PRIVACY: QA[] = [
  { q: "Wat doen jullie met mijn data?", a: "Zo min mogelijk verzamelen, netjes verwerken, niets doorverkopen." },
  { q: "Werken jullie met affiliate links?", a: "Soms. Aanbevelingen blijven stijl- en pasvormgedreven, niet om de commissie." },
];

export default function FAQPage() {
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
          subtitle="Snel antwoord. En anders: stel je vraag gerust."
          align="left"
          as="h1"
          size="sm"
          ctas={[
            { label: "Start gratis", to: "/results", variant: "primary" },
            { label: "Mail ons", to: "mailto:support@fitfi.ai", variant: "secondary" }
          ]}
        />

        <section className="ff-container py-10">
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h2 className="font-montserrat text-xl text-[var(--color-text)] mb-3">Account & betalingen</h2>
              <div className="grid gap-3">
                {ACCOUNT.map((item, i) => (
                  <details key={i} className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                    <summary className="cursor-pointer font-montserrat text-[var(--color-text)]">{item.q}</summary>
                    <div className="mt-2 text-[var(--color-text)]/80">{item.a}</div>
                  </details>
                ))}
              </div>
            </div>

            <div>
              <h2 className="font-montserrat text-xl text-[var(--color-text)] mb-3">Over de scan</h2>
              <div className="grid gap-3">
                {QUIZ.map((item, i) => (
                  <details key={i} className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                    <summary className="cursor-pointer font-montserrat text-[var(--color-text)]">{item.q}</summary>
                    <div className="mt-2 text-[var(--color-text)]/80">{item.a}</div>
                  </details>
                ))}
              </div>
            </div>

            <div>
              <h2 className="font-montserrat text-xl text-[var(--color-text)] mb-3">Outfits & advies</h2>
              <div className="grid gap-3">
                {OUTFITS.map((item, i) => (
                  <details key={i} className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                    <summary className="cursor-pointer font-montserrat text-[var(--color-text)]">{item.q}</summary>
                    <div className="mt-2 text-[var(--color-text)]/80">{item.a}</div>
                  </details>
                ))}
              </div>
            </div>

            <div>
              <h2 className="font-montserrat text-xl text-[var(--color-text)] mb-3">Privacy & links</h2>
              <div className="grid gap-3">
                {PRIVACY.map((item, i) => (
                  <details key={i} className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                    <summary className="cursor-pointer font-montserrat text-[var(--color-text)]">{item.q}</summary>
                    <div className="mt-2 text-[var(--color-text)]/80">{item.a}</div>
                  </details>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <a href="/results" className="ff-btn ff-btn-primary">Start gratis</a>
            <a href="/hoe-het-werkt" className="ff-btn ff-btn-secondary">Hoe het werkt</a>
          </div>
        </section>
      </main>
    </>
  );
}