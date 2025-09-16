// src/components/brand/BrandStrip.tsx
import React from "react";

/**
 * BrandStrip
 * Inline SVG "trusted by" badges zonder externe assets.
 * Houdt zich volledig aan tokens en a11y.
 */
const marks = [
  { label: "StyleLab", id: "stylelab" },
  { label: "WardrobeOS", id: "wardrobe" },
  { label: "FitEngine", id: "fitengine" },
  { label: "TrendGrid", id: "trendgrid" },
  { label: "NovaTech", id: "novatech" },
];

const Mark: React.FC<{ label: string; id: string }> = ({ label, id }) => (
  <div className="brand-logo" aria-label={label}>
    <svg
      className="brand-logo__svg"
      viewBox="0 0 24 24"
      role="img"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${id}-g`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.65" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.35" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="6" fill="none" stroke="currentColor" strokeOpacity="0.25" />
      <path d="M7 14.5c2.2-2.2 3.8-3.8 6-6l4 4" fill="none" stroke={`url(#${id}-g)`} strokeWidth="2" strokeLinecap="round" />
    </svg>
    <span className="brand-logo__label">{label}</span>
  </div>
);

const BrandStrip: React.FC = () => {
  return (
    <div className="brandstrip" role="region" aria-label="Vertrouwd door merken">
      <div className="brandstrip__inner">
        {marks.map((m) => (
          <Mark key={m.id} label={m.label} id={m.id} />
        ))}
      </div>
    </div>
  );
};

export default BrandStrip;