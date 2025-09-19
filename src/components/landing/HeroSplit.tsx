import React from "react";
import Button from "@/components/ui/Button";
import SmartImage from "@/components/media/SmartImage";

type Props = {
  onStart?: () => void;
  onExample?: () => void;
  /** CSS object-position, bv. "50% 35%" */
  focal?: string;
  imageId?: string;
  imageAlt?: string;
  kicker?: string;
  title?: string;
  lead?: string;
};

const HeroSplit: React.FC<Props> = ({
  onStart,
  onExample,
  focal = "50% 35%",
  imageId = "hero-main",
  imageAlt = "Voorbeeld van het AI Style Report met outfits in FitFi",
  kicker = "PRIVACY-FIRST",
  title = "AI-gestuurde styling in 3 rustige stappen",
  lead = "Onze computer vision en ML-modellen vertalen je antwoorden naar een stijlprofiel met outfits die werken voor jouw silhouet, materialen en kleurtemperatuur — zonder ruis.",
}) => {
  return (
    <section className="ff-section hero-split-wrap alt-bg" aria-labelledby="hero-split-title">
      <div className="ff-container hero-split-grid">
        {/* LINKERKOLOM */}
        <div className="split-copy">
          <p className="split-kicker">{kicker}</p>
          <h1 id="hero-split-title" className="split-title">{title}</h1>
          <p className="split-lead">{lead}</p>

          {/* Feature chips (met eenvoudige iconen, geen extra deps) */}
          <ul className="split-features" aria-label="Belangrijkste eigenschappen">
            <li className="feature-chip" role="listitem">
              <span className="chip-ico" aria-hidden>⏱️</span>
              <span>Klaar in 2 minuten</span>
            </li>
            <li className="feature-chip" role="listitem">
              <span className="chip-ico" aria-hidden>🛡️</span>
              <span>Privacy-first</span>
            </li>
            <li className="feature-chip" role="listitem">
              <span className="chip-ico" aria-hidden>📷</span>
              <span>Foto optioneel</span>
            </li>
          </ul>

          <div className="cluster mt-3">
            <Button variant="primary" size="lg" className="cta-raise" onClick={onStart}>
              Start gratis
            </Button>
            <Button variant="ghost" size="lg" onClick={onExample}>
              Bekijk voorbeeld
            </Button>
          </div>
        </div>

        {/* RECHTERKOLOM (groot beeld) */}
        <figure
          className="split-media"
          style={
            {
              // @ts-expect-error custom property
              "--hero-object-position": focal,
            } as React.CSSProperties
          }
        >
          <SmartImage id={imageId} kind="generic" alt={imageAlt} className="split-img" />
          <figcaption className="sr-only">{imageAlt}</figcaption>
        </figure>
      </div>
    </section>
  );
};

export default HeroSplit;