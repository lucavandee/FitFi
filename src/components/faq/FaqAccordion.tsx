import React, { useMemo } from "react";

export type FaqItem = { q: string; a: string; tags?: string[] };

type Props = {
  items: FaqItem[];
  query?: string;
  selectedTags?: string[];
};

const norm = (s: string) => s.toLowerCase().normalize("NFKD");

const FaqAccordion: React.FC<Props> = ({ items, query = "", selectedTags = [] }) => {
  const filtered = useMemo(() => {
    const q = norm(query.trim());
    const hasTags = selectedTags.length > 0;

    return items.filter((it) => {
      const matchesQ = !q || norm(it.q).includes(q) || norm(it.a).includes(q);
      const matchesTags =
        !hasTags || (it.tags && selectedTags.every((t) => it.tags!.includes(t)));
      return matchesQ && matchesTags;
    });
  }, [items, query, selectedTags]);

  if (filtered.length === 0) {
    return (
      <div
        role="status"
        className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center shadow-[var(--shadow-soft)]"
      >
        Geen resultaten. Pas je zoekterm of filters aan.
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