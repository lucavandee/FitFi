import React from "react";

export type FaqItem = { q: string; a: string; slug?: string };

type Props = {
  items: FaqItem[];
  allowMultiple?: boolean;
  /** Optioneel: filtertekst (case-insensitive) om items te tonen/verbergen */
  filterText?: string;
};

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const FaqAccordion: React.FC<Props> = ({ items, allowMultiple = false, filterText = "" }) => {
  // Bereid items met slug voor
  const withSlugs = React.useMemo(
    () => items.map((it) => ({ ...it, slug: it.slug ?? slugify(it.q) })),
    [items]
  );

  const filter = filterText.trim().toLowerCase();
  const filtered = React.useMemo(() => {
    if (!filter) return withSlugs;
    return withSlugs.filter((it) => `${it.q} ${it.a}`.toLowerCase().includes(filter));
  }, [withSlugs, filter]);

  // Open state (index in gefilterde lijst)
  const [open, setOpen] = React.useState<number | null>(filtered.length ? 0 : null);

  // Wanneer filter verandert en huidige open item niet meer bestaat → reset naar eerste
  React.useEffect(() => {
    setOpen(filtered.length ? 0 : null);
  }, [filter, filtered.length]);

  // Hash deeplink (#slug) → open + smooth scroll
  React.useEffect(() => {
    const applyHash = () => {
      const h = (typeof window !== "undefined" && window.location.hash) || "";
      const target = h.startsWith("#") ? h.slice(1) : "";
      if (!target) return;
      const idx = filtered.findIndex((it) => it.slug === target);
      if (idx >= 0) {
        setOpen(idx);
        // focus en scroll
        const el = document.getElementById(target);
        if (el) {
          el.scrollIntoView({ block: "start", behavior: "smooth" });
          (el.querySelector<HTMLButtonElement>(".faq-qbtn") || el).focus();
        }
      }
    };
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, [filtered]);

  const toggle = (idx: number) => {
    if (allowMultiple) return; // (kan later uitgebreid worden)
    setOpen((prev) => (prev === idx ? null : idx));
  };

  if (!filtered.length) {
    return (
      <div className="card" role="status" aria-live="polite">
        <p className="text-[var(--color-muted)]">Geen resultaten voor je zoekopdracht.</p>
      </div>
    );
  }

  return (
    <div className="faq-accordion" role="list">
      {filtered.map((it, idx) => {
        const isOpen = open === idx;
        const panelId = `faq-panel-${it.slug}`;
        const btnId = `faq-btn-${it.slug}`;
        return (
          <article key={it.slug} id={it.slug} role="listitem" className="faq-item card">
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
            <div id={panelId} role="region" aria-labelledby={btnId} className={`faq-panel ${isOpen ? "is-open" : ""}`}>
              <p className="faq-answer">{it.a}</p>
            </div>
          </article>
        );
      })}
    </div>
  );
};

export default FaqAccordion;