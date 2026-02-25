import React from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "default" | "light" | "dark";
  className?: string;
}

/*
  FitFi wordmark — pure SVG paths, geen <text>, altijd identiek.

  Concept: één aaneengesloten naam "FitFi"
  - Letters zijn modern geometrisch sans-serif (vergelijkbaar Futura/Montserrat)
  - De twee "i"-punten zijn kleine ruitjes (◆) in de brand-taupe kleur
    → het enige creatieve accent, subtiel maar herkenbaar
  - "Fi" (tweede helft) is iets lichter dan "Fit" (eerste helft)
    zodat er een zachte visuele ritmiek is zonder separator
  - Alle stroken zijn rounded, clean, couture
*/

const Logo: React.FC<LogoProps> = ({
  size = "md",
  variant = "default",
  className = "",
}) => {
  const scale: Record<string, number> = { sm: 0.6, md: 1, lg: 1.5 };
  const s = scale[size];

  const ink =
    variant === "light" ? "#FFFFFF"
    : variant === "dark"  ? "#1E2333"
    : "var(--color-text)";

  const inky =
    variant === "light" ? "rgba(255,255,255,0.55)"
    : "var(--ff-color-primary-600)";

  const diamond =
    variant === "light" ? "rgba(255,255,255,0.85)"
    : "var(--ff-color-primary-500)";

  const W = Math.round(102 * s);
  const H = Math.round(26 * s);

  return (
    <svg
      width={W}
      height={H}
      viewBox="0 0 102 26"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="FitFi"
      role="img"
      style={{ display: "block", overflow: "visible" }}
    >
      {/*
        Lettergeometrie in één viewBox 102×26.
        Strokbreedte van opstaande staven: 2.6
        Cap-height: 20 (y=3 tot y=23), x-height: 14 (y=9 tot y=23)
        Spacing tussen letters: 2.5
      */}

      {/* ── F ── (x: 0–14) */}
      {/* verticale stam */}
      <rect x="0"   y="3"    width="2.6" height="20" rx="1.3" fill={ink} />
      {/* top balk */}
      <rect x="0"   y="3"    width="14"  height="2.6" rx="1.3" fill={ink} />
      {/* midden balk */}
      <rect x="0"   y="12.7" width="10.5" height="2.4" rx="1.2" fill={ink} />

      {/* ── i ── (x: 16.5–19.1) */}
      <rect x="16.5" y="9"  width="2.6" height="14" rx="1.3" fill={ink} />
      {/* ruitje als punt: polygon centred at (17.8, 3.6) */}
      <polygon points="17.8,1.2 20.2,3.6 17.8,6.0 15.4,3.6" fill={diamond} />

      {/* ── t ── (x: 22–32) */}
      {/* verticale stam (loopt van cap-height naar basis) */}
      <rect x="24.5" y="3"  width="2.6" height="20" rx="1.3" fill={ink} />
      {/* dwarsbalk */}
      <rect x="21"   y="9"  width="9.5" height="2.4" rx="1.2" fill={ink} />

      {/* ── F (tweede, iets lichter) ── (x: 35–49) */}
      <rect x="35"   y="3"    width="2.6" height="20" rx="1.3" fill={inky} />
      <rect x="35"   y="3"    width="14"  height="2.6" rx="1.3" fill={inky} />
      <rect x="35"   y="12.7" width="10.5" height="2.4" rx="1.2" fill={inky} />

      {/* ── i (tweede) ── (x: 51.5–54.1) */}
      <rect x="51.5" y="9"  width="2.6" height="14" rx="1.3" fill={inky} />
      {/* ruitje als punt: polygon centred at (52.8, 3.6) */}
      <polygon points="52.8,1.2 55.2,3.6 52.8,6.0 50.4,3.6" fill={diamond} />
    </svg>
  );
};

export default Logo;
