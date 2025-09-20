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
    q: "Wat gebeurt er met mijn data?",
    a: "We verzamelen alleen wat nodig is voor jouw advies en we delen geen persoonsgegevens met derden.",
  },
];

const PricingFaqTeaser: React.FC = () => {
  return (
    <section className="ff-section" aria-labelledby="faq-title">
      <div className="ff-container">
        <header className="section-header mb-4">
          <p className="kicker">FAQ</p>
          <h2 id="faq-title" className="section-title">Veelgestelde vragen</h2>
          <p className="section-intro">Kort en helder. Meer vragen? Bekijk de volledige FAQ.</p>
        </header>

        <div className="faq-teaser grid gap-4 md:grid-cols-2">
          {faqs.map((f) => (
            <details key={f.q} className="faq-item">
              <summary className="faq-summary">{f.q}</summary>
              <div className="faq-answer">{f.a}</div>
            </details>
          ))}
        </div>

        <div className="mt-6">
          <a className="link" href="/faq" aria-label="Ga naar de FAQ pagina">
            Bekijk alle vragen →
          </a>
        </div>
      </div>
    </section>
  );
};

export default PricingFaqTeaser;