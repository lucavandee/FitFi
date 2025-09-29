import React from "react";
import { QuoteIcon } from "lucide-react";
import { useFadeInOnVisible } from "@/hooks/useFadeInOnVisible";
import PressLogoBelt from "@/components/landing/PressLogoBelt";

type Quote = {
  text: string;
  name: string;
  meta: string;          // stad/beroep e.d.
  avatar?: string;       // optioneel pad naar /public/images/avatars/*
};

const QUOTES: Quote[] = [
  {
    text:
      "Het rapport vatte mijn stijl perfect samen. De outfits klopten echt en schelen miskopen.",
    name: "Sanne",
    meta: "Amsterdam",
    avatar: "/images/avatars/avatar1.png",
  },
  {
    text:
      "In twee minuten had ik een plan én items die ik direct kon shoppen. Precies de juiste balans.",
    name: "Milan",
    meta: "Utrecht",
    avatar: "/images/avatars/avatar2.png",
  },
  {
    text:
      "Rustige, moderne outfits die aansluiten op mijn silhouet en kleuren. Eindelijk richting.",
    name: "Lara",
    meta: "Rotterdam",
    avatar: "/images/avatars/avatar3.png",
  },
];

const SocialProofEditorial: React.FC = () => {
  return (
    <section aria-labelledby="social-proof-title" className="ff-section">
      <div className="ff-container flow-lg">
        <header className="flow-sm">
          <h2 id="social-proof-title" className="section-title">Wat gebruikers zeggen</h2>
          <p className="text-[var(--color-muted)] max-w-prose">
            Echte ervaringen — kort en helder. Geen ruis, wel resultaat.
          </p>
        </header>

        {/* Quotes */}
        <div className="sp-grid">
          {QUOTES.map((q) => {
            const { ref, visible } = useFadeInOnVisible<HTMLElement>();
            return (
              <figure
                key={q.name}
                ref={ref as any}
                className="sp-quote card card-hover"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateY(0)" : "translateY(8px)",
                  transition: "opacity 500ms ease, transform 500ms ease",
                }}
              >
                <QuoteIcon size={18} aria-hidden className="sp-quote-mark" />
                {q.avatar ? (
                  <img
                    src={q.avatar}
                    alt={`Portret van ${q.name}`}
                    width={40}
                    height={40}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "9999px",
                      objectFit: "cover",
                      border: "1px solid var(--color-border)",
                    }}
                    onError={(e) => {
                      // Verberg avatar gracieus als het bestand ontbreekt
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : null}
                <blockquote className="sp-quote-text">"{q.text}"</blockquote>
                <figcaption
                  className="sp-quote-meta"
                  style={{ display: "grid", gap: "2px" }}
                >
                  <span className="sp-quote-name" style={{ fontWeight: 700 }}>
                    {q.name}
                  </span>
                  <span className="sp-quote-city" style={{ color: "var(--color-muted)" }}>
                    {q.meta}
                  </span>
                </figcaption>
              </figure>
            );
          })}
        </div>

        {/* Press/logo belt met echte assets (graceful fallback) */}
        <PressLogoBelt />
      </div>
    </section>
  );
};

export default SocialProofEditorial;