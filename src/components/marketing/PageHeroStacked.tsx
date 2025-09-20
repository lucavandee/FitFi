import React from "react";
import Button from "@/components/ui/Button";
import SmartImage from "@/components/media/SmartImage";

type Props = {
  kicker: string;
  title: string;
  lead: string;
  chips?: string[];
  imageId?: string;
  imageAlt?: string;
  focal?: string; // CSS object-position, bv. "50% 38%"
  primaryLabel?: string;
  secondaryLabel?: string;
  onPrimary?: () => void;
  onSecondary?: () => void;
};

const PageHeroStacked: React.FC<Props> = ({
  kicker,
  title,
  lead,
  chips = [],
  imageId = "hero-main",
  imageAlt = "Hero visual",
  focal = "50% 38%",
  primaryLabel = "Start gratis",
  secondaryLabel = "Bekijk voorbeeld",
  onPrimary,
  onSecondary,
}) => {
  return (
    <section className="ff-section pagehero-wrap alt-bg" aria-labelledby="pagehero-title">
      <div className="ff-container pagehero">
        <header className="pagehero-head">
          <p className="pagehero-kicker">{kicker}</p>
          <h1 id="pagehero-title" className="pagehero-title">{title}</h1>
          <p className="pagehero-lead">{lead}</p>

          <div className="cluster mt-3">
            <Button variant="primary" size="lg" className="cta-raise" onClick={() => onPrimary && onPrimary()}>
              {primaryLabel}
            </Button>
            <Button variant="ghost" size="lg" onClick={() => onSecondary && onSecondary()}>
              {secondaryLabel}
            </Button>
          </div>

          {chips.length > 0 && (
            <ul className="usp-rail" aria-label="Belangrijkste voordelen">
              {chips.map((c) => (
                <li key={c} className="usp-chip">{c}</li>
              ))}
            </ul>
          )}
        </header>

        <figure
          className="pagehero-media"
          style={
            {
              // @ts-expect-error custom property
              "--hero-object-position": focal,
            } as React.CSSProperties
          }
        >
          <SmartImage id={imageId} kind="generic" alt={imageAlt} className="pagehero-img" />
          <figcaption className="sr-only">{imageAlt}</figcaption>
        </figure>
      </div>
    </section>
  );
};

export default PageHeroStacked;