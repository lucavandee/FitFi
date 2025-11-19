import React from "react";
import Button from "@/components/ui/Button";
import SmartImage from "@/components/media/SmartImage";
import TrustBelt from "@/components/landing/TrustBelt";

type Props = {
  onStart?: () => void;
  onExample?: () => void;
  /** CSS object-position, bv. "50% 38%" */
  focal?: string;
  /** Bestaande asset-id; wijzig beeld via /public, niet in code. */
  imageId?: string;
  imageAlt?: string;
  kicker?: string;
  title?: string;
  lead?: string;
};

const HeroStacked: React.FC<Props> = ({
  onStart,
  onExample,
  focal = "50% 38%",
  imageId = "hero-main",
  imageAlt = "Voorbeeld van het AI Style Report met outfits in FitFi",
  kicker = "GRATIS AI STYLE REPORT",
  title = "Wat is jouw stijl over je zegt",
  lead = "Beantwoord 6 korte vragen en ontvang direct een persoonlijk stijlprofiel met outfits en shoplinks — privacy-first, .",
}) => {
  return (
    <section className="ff-section hero-stack-wrap alt-bg" aria-labelledby="hero-stack-title">
      <div className="ff-container hero-stack">
        <header className="stack-head">
          <p className="stack-kicker">{kicker}</p>
          <h1 id="hero-stack-title" className="stack-title">{title}</h1>
          <p className="stack-lead">{lead}</p>

          <div className="cluster mt-3">
            <Button variant="primary" size="lg" className="cta-raise" onClick={onStart}>
              Start gratis
            </Button>
            {/* Gebruik secondary i.p.v. ghost om contrast te garanderen op alle achtergronden */}
            <Button variant="secondary" size="lg" onClick={onExample}>
              Bekijk voorbeeld
            </Button>
          </div>

          {/* USP-rail */}
          <ul className="usp-rail" aria-label="Belangrijkste voordelen">
            <li className="usp-chip">100% gratis</li>
            <li className="usp-chip"></li>
            <li className="usp-chip">Outfits + shoplinks</li>
            <li className="usp-chip"></li>
          </ul>

          {/* Trust & privacy badges (compact, consistent) */}
          <TrustBelt />
        </header>

        {/* Groot beeld — behoud huidige asset via id; vervang het daadwerkelijke bestand in /public */}
        <figure
          className="stack-media"
          style={
            {
              // @ts-expect-error custom CSS var toegestaan in CSS
              "--hero-object-position": focal,
            } as React.CSSProperties
          }
        >
          <SmartImage id={imageId} alt={imageAlt} className="stack-img" width={800} height={1000} />
          <figcaption className="sr-only">{imageAlt}</figcaption>
        </figure>
      </div>
    </section>
  );
};

export default HeroStacked;