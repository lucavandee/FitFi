import React from "react";
import { NavLink } from "react-router-dom";
import { ChevronDown } from "lucide-react";

const QAS = [
  {
    q: "Is FitFi echt gratis te proberen?",
    a: (
      <>
        Ja. Met <strong>Starter</strong> kun je gratis starten. Later upgraden kan altijd.
      </>
    )
  },
  {
    q: "Wat houdt het AI Style Report in?",
    a: (
      <>
        Een helder overzicht van wat werkt voor jou (silhouet, kleur, materiaal) en waarom.
      </>
    )
  },
  {
    q: "Wat doen jullie met mijn gegevens?",
    a: (
      <>
        We minimaliseren data en verkopen niets door. Zie de{" "}
        <NavLink to="/privacy" className="text-primary underline">
          privacyverklaring
        </NavLink>
        .
      </>
    )
  },
  {
    q: "Kan ik op elk moment opzeggen?",
    a: <>Ja. Maandabonnementen zijn flexibel — geen gedoe.</>
  },
  {
    q: "Werken jullie met affiliate links?",
    a: <>Soms. Aanbevelingen blijven altijd stijl- en pasvorm-gedreven.</>
  }
];

export default function FAQPage() {
  return (
    <main id="main" className="bg-bg text-text">
      <section className="ff-container ff-stack-lg py-12 sm:py-14">
        <header className="ff-stack">
          <p className="text-sm text-text/70">Helder en nuchter</p>
          <h1 className="font-heading text-2xl sm:text-3xl ff-text-balance">
            Veelgestelde vragen
          </h1>
          <p className="text-text/80 max-w-2xl">
            Kort en duidelijk. Staat je vraag er niet bij? Stuur ons een bericht.
          </p>
        </header>

        <div className="ff-faq max-w-3xl">
          {QAS.map((item, index) => (
            <details key={index} className="ff-accordion">
              <summary className="head">
                <span className="title">{item.q}</span>
                <ChevronDown className="w-5 h-5 text-text/60" />
              </summary>
              <div className="content">{item.a}</div>
            </details>
          ))}
        </div>

        <div className="cta-row">
          <NavLink to="/support" className="ff-btn ff-btn-secondary">
            Contact support
          </NavLink>
          <NavLink to="/quiz" className="ff-btn ff-btn-primary">
            Start gratis
          </NavLink>
        </div>
      </section>
    </main>
  );
}