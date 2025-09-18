import React from "react";
import Button from "@/components/ui/Button";
import SmartImage from "@/components/media/SmartImage";

type Props = {
  /** Primary CTA */
  onCTAClick?: () => void;
  /** Secondary CTA (optioneel) */
  onSecondaryClick?: () => void;
  /** Object-position (bv. "50% 35%") om de visuele focus te sturen */
  focal?: string;
  /** Optioneel: SmartImage id van het hero-beeld (we gebruiken de bestaande asset-lijn) */
  imageId?: string;
  /** Optioneel: alternatieve alt-tekst voor het hero-beeld */
  imageAlt?: string;
  /** Toon of verberg de secundaire CTA */
  showSecondary?: boolean;
};

const Hero: React.FC<Props> = ({
  onCTAClick,
  onSecondaryClick,
  focal = "50% 40%",
  imageId = "hero-main", // gebruik jullie bestaande SmartImage/asset id
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
            Beantwoord 6 korte vragen en ontvang direct een persoonlijk stijlprofiel met outfits en shoplinks —
            privacy-first, zonder ruis.
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
        </div>

        {/* MEDIA */}
        <figure
          className="hero-media"
          style={
            {
              // CSS var voor object-position (kan door polish.css worden opgepakt)
              // @ts-expect-error CSS custom property
              "--hero-object-position": focal,
            } as React.CSSProperties
          }
        >
          <SmartImage
            id={imageId}
            kind="generic"
            alt={imageAlt}
            className="hero-img"
          />
          <figcaption className="sr-only">
            {imageAlt}
          </figcaption>
        </figure>
      </div>
    </section>
  );
};

export default Hero;