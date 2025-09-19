import React from "react";
import Button from "@/components/ui/Button";
import SmartImage from "@/components/media/SmartImage";

type Props = {
  onStart?: () => void;
  onExample?: () => void;
  /** CSS object-position, bv. "50% 35%" om het focuspunt te zetten */
  focal?: string;
  /** Bestaande SmartImage id */
  imageId?: string;
  imageAlt?: string;
};

const HomeFold: React.FC<Props> = ({
  onStart,
  onExample,
  focal = "50% 35%",
  imageId = "hero-main",
  imageAlt = "Voorbeeld van het AI Style Report met outfits in FitFi",
}) => {
  return (
    <section className="ff-section homefold-wrap alt-bg" aria-labelledby="homefold-title">
      <div className="ff-container homefold-grid">
        {/* Editorial header (zoals /hoe-het-werkt, maar hero-variant) */}
        <header className="section-header">
          <p className="kicker">Gratis AI Style Report</p>
          <h1 id="homefold-title" className="section-title">
            Ontdek wat jouw stijl over je zegt
          </h1>
          <p className="section-intro">
            Beantwoord 6 korte vragen en ontvang direct een persoonlijk stijlprofiel met outfits en shoplinks —
            privacy-first, zonder ruis.
          </p>

          <div className="cluster mt-3">
            <Button variant="primary" size="lg" className="cta-raise" onClick={onStart}>
              Start gratis
            </Button>
            <Button variant="ghost" size="lg" onClick={onExample}>
              Bekijk voorbeeld
            </Button>
          </div>

          {/* USP-rail onder de CTA's, compact en stil */}
          <ul className="usp-rail" aria-label="Belangrijkste voordelen">
            <li className="usp-chip">100% gratis</li>
            <li className="usp-chip">Klaar in 2 min</li>
            <li className="usp-chip">Outfits + shoplinks</li>
            <li className="usp-chip">Privacy-first</li>
          </ul>
        </header>

        {/* Media (XL overscan) */}
        <figure
          className="homefold-media"
          style={
            {
              // @ts-expect-error custom property
              "--hero-object-position": focal,
            } as React.CSSProperties
          }
        >
          <SmartImage id={imageId} kind="generic" alt={imageAlt} className="homefold-img" />
          <figcaption className="sr-only">{imageAlt}</figcaption>
        </figure>
      </div>
    </section>
  );
};

export default HomeFold;