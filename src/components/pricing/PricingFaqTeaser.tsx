import React from "react";

const faqs = [
  {
    q: "Is het echt gratis?",
    a: "Ja. Je start met een gratis AI Style Report. Upgraden kan later — volledig optioneel.",
  },
  {
    q: "Heb ik een account of creditcard nodig?",
    a: "Nee. Je kunt zonder account of creditcard je rapport bekijken.",
  },
  {
    q: "Werkt het ook zonder foto?",
    a: "Ja. Een foto is optioneel. Je krijgt nog steeds een stijlprofiel met outfits en shoplinks.",
  },
  {
    q: "Kan ik opzeggen wanneer ik wil?",
    a: "Zeker. Je behoudt altijd toegang tot je basisrapport.",
  },
];

const PricingFaqTeaser: React.FC = () => {
  return (
    <section className="ff-section bg-[var(--color-bg)]">
      <div className="ff-container">
        <header className="section-header">
          <p className="kicker">FAQ</p>
          <h2 className="section-title">Veelgestelde vragen</h2>
        </header>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {faqs.map((f) => (
            <details key={f.q} className="ff-card">
              <summary className="ff-card__title">{f.q}</summary>
              <div className="ff-card__body">{f.a}</div>
            </details>
          ))}
        </div>

        <div className="mt-6">
          <a className="link" href="/veelgestelde-vragen" aria-label="Ga naar de FAQ pagina">
            Bekijk alle vragen →
          </a>
        </div>
      </div>
    </section>
  );
};

export default PricingFaqTeaser;