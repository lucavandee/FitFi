import React from "react";

export type FaqItem = { q: string; a: string };

const FaqAccordion: React.FC<{
  items: FaqItem[];
  allowMultiple?: boolean;
}> = ({ items, allowMultiple = false }) => {
  const [open, setOpen] = React.useState<number | null>(0); // eerste open

  const toggle = (idx: number) => {
    if (allowMultiple) return; // (kan later uitgebreid worden)
    setOpen((prev) => (prev === idx ? null : idx));
  };

  return (
    <div className="faq-accordion" role="list">
      {items.map((it, idx) => {
        const isOpen = open === idx;
        const panelId = `faq-panel-${idx}`;
        const btnId = `faq-btn-${idx}`;

        return (
          <article key={it.q} role="listitem" className="faq-item card">
            <h3 className="sr-only">{it.q}</h3>
            <button
              id={btnId}
              className={`faq-qbtn ${isOpen ? "is-open" : ""}`}
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => toggle(idx)}
            >
              <span>{it.q}</span>
              <span className="faq-icon" aria-hidden>
                {isOpen ? "–" : "+"}
              </span>
            </button>
            <div
              id={panelId}
              role="region"
              aria-labelledby={btnId}
              className={`faq-panel ${isOpen ? "is-open" : ""}`}
            >
              <p className="faq-answer">{it.a}</p>
            </div>
          </article>
        );
      })}
    </div>
  );
};

export default FaqAccordion;