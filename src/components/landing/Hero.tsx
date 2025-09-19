import React from "react";
import Button from "@/components/ui/Button";
import SmartImage from "@/components/media/SmartImage";

type Props = {
  onCTAClick?: () => void;
  onSecondaryClick?: () => void;
  /** CSS object-position, bv. "50% 35%" om het focuspunt van de afbeelding te sturen */
  focal?: string;
  imageId?: string;
  imageAlt?: string;
  showSecondary?: boolean;
};

const Hero: React.FC<Props> = ({
  onCTAClick,
  onSecondaryClick,
  focal = "50% 35%",
  imageId = "hero-main",
  imageAlt = "Voorbeeld van het AI Style Report in een rustige interface",
  showSecondary = true,
}) => {
  return (
    <section className="ff-section hero-wrap alt-bg" aria-labelledby="hero-title">
      <div className="ff-container hero-grid">
        {/* COPY */}
        <div className="hero-copy">
          <p className="kicker">Gratis AI Style Report</p>
          <h1 id="hero-title" className="section-title">
            Ontdek wat jouw stijl over je zegt
          </h1>
          <p className="lead">
            Beantwoord 6 korte vragen en ontvang direct een persoonlijk stijlprofiel met outfits en
            shoplinks — privacy-first, zonder ruis.
          </p>

          <div className="cluster mt-3">
            <Button variant="primary" size="lg" className="cta-raise" onClick={onCTAClick}>
              Start gratis
            </Button>
            {showSecondary && (
              <Button variant="ghost" size="lg" onClick={onSecondaryClick}>
                Bekijk voorbeeld
              </Button>
            )}
          </div>

          {/* USP-rail (compacte chips onder de CTA's) */}
          <ul className="usp-rail" aria-label="Belangrijkste voordelen">
            <li className="usp-chip">100% gratis</li>
            <li className="usp-chip">Klaar in 2 min</li>
            <li className="usp-chip">Outfits + shoplinks</li>
            <li className="usp-chip">Privacy-first</li>
          </ul>
        </div>

        {/* MEDIA */}
        <figure
          className="hero-media"
          style={
            {
              // @ts-expect-error CSS custom property
              "--hero-object-position": focal,
            } as React.CSSProperties
          }
        >
          <SmartImage id={imageId} kind="generic" alt={imageAlt} className="hero-img" />
          <figcaption className="sr-only">{imageAlt}</figcaption>
        </figure>
      </div>
    </section>
  );
};

export default Hero;