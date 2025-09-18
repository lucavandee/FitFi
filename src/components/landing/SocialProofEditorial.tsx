import React from "react";
import { QuoteIcon } from "lucide-react";

type Quote = {
  text: string;
  name: string;
  meta: string; // stad/beroep e.d.
};

const QUOTES: Quote[] = [
  {
    text:
      "Het rapport vatte mijn stijl perfect samen. De outfits klopten echt en schelen miskopen.",
    name: "Sanne",
    meta: "Amsterdam",
  },
  {
    text:
      "In twee minuten had ik een plan én items die ik direct kon shoppen. Precies de juiste balans.",
    name: "Milan",
    meta: "Utrecht",
  },
  {
    text:
      "Rustige, moderne outfits die aansluiten op mijn silhouet en kleuren. Eindelijk richting.",
    name: "Lara",
    meta: "Rotterdam",
  },
];

const LOGOS = ["AD", "LINDA.", "RTL", "Sprout", "Bright"];

const SocialProofEditorial: React.FC = () => {
  return (
    <section aria-labelledby="social-proof-title" className="ff-section">
      <div className="ff-container flow-lg">
        <header className="flow-sm">
          <h2 id="social-proof-title" className="section-title">
            Wat gebruikers zeggen
          </h2>
          <p className="text-[var(--color-muted)] max-w-prose">
            Echte ervaringen — kort en helder. Geen ruis, wel resultaat.
          </p>
        </header>

        {/* Quotes */}
        <div className="sp-grid">
          {QUOTES.map((q) => (
            <figure key={q.name} className="sp-quote card card-hover">
              <QuoteIcon size={18} aria-hidden className="sp-quote-mark" />
              <blockquote className="sp-quote-text">"{q.text}"</blockquote>
              <figcaption className="sp-quote-meta">
                <span className="sp-quote-name">{q.name}</span>
                <span className="sp-quote-dot" aria-hidden>•</span>
                <span className="sp-quote-city">{q.meta}</span>
              </figcaption>
            </figure>
          ))}
        </div>

        {/* Logo belt */}
        <div className="sp-press">
          <span className="text-[var(--color-muted)]">Gezien in</span>
          <ul className="sp-press-list" aria-label="Media">
            {LOGOS.map((l) => (
              <li key={l} className="press-chip" aria-label={l}>
                {l}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default SocialProofEditorial;