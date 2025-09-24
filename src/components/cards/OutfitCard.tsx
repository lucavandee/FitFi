import React from "react";

type Props = {
  imageSrc: string;
  title: string;
  context?: string;
  tags?: string[];
  ctaLabel?: string;
  onCta?: () => void;
};

export default function OutfitCard({ 
  imageSrc, 
  title, 
  context, 
  tags = [], 
  ctaLabel = "Bekijk", 
  onCta 
}: Props) {
  return (
    <article className="ff-card overflow-hidden">
      <div className="hero-image">
        <img src={imageSrc} alt="" />
      </div>
      <div className="p-4 ff-stack">
        <header className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-text">{title}</h3>
          {context ? <span className="ff-badge">{context}</span> : null}
        </header>

        {tags.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <li key={tag} className="ff-chip text-xs">{tag}</li>
            ))}
          </ul>
        )}

        <div className="cta-row">
          <button type="button" onClick={onCta} className="ff-btn ff-btn-primary">
            {ctaLabel}
          </button>
        </div>
      </div>
    </article>
  );
}