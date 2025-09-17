import React from "react";
import { Quote } from "lucide-react";

const quotes = [
  { q: "Het rapport vatte mijn stijl perfect samen. De outfits klopten echt en schelen miskopen.", a: "Sanne — Amsterdam" },
  { q: "In twee minuten had ik een plan én items die ik direct kon shoppen. Precies de juiste balans.", a: "Milan — Utrecht" },
  { q: "Rustige, moderne outfits die aansluiten op mijn silhouet en kleuren. Eindelijk richting.", a: "Lara — Rotterdam" },
];

const SocialProofEditorial: React.FC = () => (
  <section aria-labelledby="social-proof-editorial">
    <h2 id="social-proof-editorial" className="text-2xl md:text-3xl font-semibold text-[var(--color-text)] mb-8">
      Wat gebruikers zeggen
    </h2>

    <div className="space-y-8">
      {quotes.map((t, i) => (
        <blockquote
          key={i}
          className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-6 shadow-[var(--shadow-soft)]"
        >
          <div className="flex items-start gap-3">
            <Quote className="text-[var(--ff-color-primary-600)] shrink-0 mt-1" size={20} aria-hidden />
            <p className="text-lg text-[var(--color-text)] leading-relaxed">"{t.q}"</p>
          </div>
          <footer className="mt-3 text-sm text-[var(--color-muted)]">{t.a}</footer>
        </blockquote>
      ))}
    </div>
  </section>
);

export default SocialProofEditorial;