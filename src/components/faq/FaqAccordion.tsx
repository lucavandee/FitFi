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
      const matchesTags = !hasTags || (it.tags && selectedTags.every((t) => it.tags!.includes(t)));
      return matchesQ && matchesTags;
    });
  }, [items, query, selectedTags]);

  if (filtered.length === 0) {
    return (
      <div role="status" className="rounded-2xl border border-[#E5E5E5] bg-[#FFFFFF] p-6 text-center shadow-sm">
        Geen resultaten. Pas je zoekterm of filters aan.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {filtered.map((f) => (
        <details key={f.q} className="faq-item bg-white border border-[#E5E5E5] rounded-2xl p-6">
          <summary className="faq-summary text-xl font-semibold text-[#1A1A1A] mb-4">{f.q}</summary>
          <div className="faq-answer text-base text-[#4A4A4A]">{f.a}</div>
        </details>
      ))}
    </div>
  );
};

export default FaqAccordion;