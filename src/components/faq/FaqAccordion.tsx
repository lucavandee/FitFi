import React, { useMemo } from "react";

export type FaqItem = { q: string; a: string };

type Props = {
  items: FaqItem[];
  query?: string;
};

const norm = (s: string) => s.toLowerCase().normalize("NFKD");

const FaqAccordion: React.FC<Props> = ({ items, query = "" }) => {
  const filtered = useMemo(() => {
    const q = norm(query.trim());
    if (!q) return items;
    return items.filter((it) => norm(it.q).includes(q) || norm(it.a).includes(q));
  }, [items, query]);

  if (filtered.length === 0) {
    return (
      <div
        role="status"
        className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center shadow-[var(--shadow-soft)]"
      >
        Geen resultaten. Probeer een ander trefwoord.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {filtered.map((f) => (
        <details key={f.q} className="faq-item">
          <summary className="faq-summary">{f.q}</summary>
          <div className="faq-answer">{f.a}</div>
        </details>
      ))}
    </div>
  );
};

export default FaqAccordion;