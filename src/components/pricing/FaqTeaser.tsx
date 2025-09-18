import React from "react";

const items = [
  {
    q: "Kan ik eerst gratis proberen?",
    a: "Ja. Start met het gratis AI Style Report. Upgrade pas als je meer wilt: wekelijkse updates en extra tools.",
  },
  {
    q: "Kan ik op elk moment opzeggen?",
    a: "Ja. Je abonnement stopt aan het einde van je periode. Jaarlijks levert 20% voordeel op.",
  },
  {
    q: "Wat doen jullie met mijn data?",
    a: "We hanteren een privacy-first aanpak. Zo weinig mogelijk data, transparant verwerkt. Jij houdt regie.",
  },
];

const FaqTeaser: React.FC = () => {
  return (
    <div className="faq-teaser">
      <h2 className="section-title">Veelgestelde vragen</h2>
      <div className="faq-list">
        {items.map((x) => (
          <details key={x.q} className="faq-item">
            <summary className="faq-q">{x.q}</summary>
            <p className="faq-a">{x.a}</p>
          </details>
        ))}
      </div>
      <p className="faq-foot text-[var(--color-muted)]">
        Meer vragen? <a className="underlined" href="/contact">Neem contact op</a>.
      </p>
    </div>
  );
};

export default FaqTeaser;