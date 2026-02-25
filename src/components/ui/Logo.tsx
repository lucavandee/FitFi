import React from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "default" | "light" | "dark";
  className?: string;
}

/*
  Wordmark: "FitFi" — geen spatie, alles aan elkaar.
  Ontwerp:
  - "Fit" — Montserrat 700, donker
  - een slanke diagonale schuine streep (/) in brand-taupe als visuele verbinding
    tussen de twee lettergrepen, ingesloten binnen de x-hoogte
  - "Fi" — Montserrat 300, brand-taupe
  De slash is bewust smaller en lichter dan de letters, waardoor
  het woordmerk een modisch/couture gevoel krijgt — vergelijkbaar
  met mode-labels als A/X of Y-3.
*/
const Logo: React.FC<LogoProps> = ({
  size = "md",
  variant = "default",
  className = "",
}) => {
  const scale: Record<string, number> = { sm: 16, md: 22, lg: 30 };
  const fs = scale[size];

  const textDark =
    variant === "light"
      ? "#FFFFFF"
      : variant === "dark"
      ? "#1E2333"
      : "var(--color-text)";

  const brandColor =
    variant === "light"
      ? "rgba(255,255,255,0.60)"
      : "var(--ff-color-primary-500)";

  const slashColor =
    variant === "light"
      ? "rgba(255,255,255,0.45)"
      : "var(--ff-color-primary-400)";

  const tracking = fs * 0.03;
  const baseline = Math.round(fs * 0.82);
  const h = Math.round(fs * 1.1);

  /* Approximate character widths for Montserrat at this size */
  const fitWidth = fs * 1.85;   /* "Fit" bold */
  const slashW = fs * 0.36;     /* visual slash gap */
  const fiWidth = fs * 1.18;    /* "Fi" light */

  const totalW = Math.ceil(fitWidth + slashW + fiWidth + tracking * 4);

  /* Slash geometry: spans the cap-height, angled ~18 deg */
  const slashX1 = fitWidth + slashW * 0.12;
  const slashX2 = fitWidth + slashW * 0.88;
  const slashTop = h * 0.08;
  const slashBot = h * 0.92;
  const slashStroke = Math.max(1, fs * 0.062);

  /* "Fi" starts after slash */
  const fiX = fitWidth + slashW;

  return (
    <svg
      width={totalW}
      height={h}
      viewBox={`0 0 ${totalW} ${h}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="FitFi"
      role="img"
      style={{ display: "block", overflow: "visible" }}
    >
      {/* "Fit" — bold, donker */}
      <text
        x={0}
        y={baseline}
        fontFamily="'Montserrat', 'Inter', system-ui, sans-serif"
        fontWeight="700"
        fontSize={fs}
        letterSpacing={tracking}
        fill={textDark}
        style={{ userSelect: "none" }}
      >
        Fit
      </text>

      {/* Diagonale verbindingsstreep */}
      <line
        x1={slashX1}
        y1={slashBot}
        x2={slashX2}
        y2={slashTop}
        stroke={slashColor}
        strokeWidth={slashStroke}
        strokeLinecap="round"
      />

      {/* "Fi" — light, brand-taupe */}
      <text
        x={fiX}
        y={baseline}
        fontFamily="'Montserrat', 'Inter', system-ui, sans-serif"
        fontWeight="300"
        fontSize={fs}
        letterSpacing={tracking}
        fill={brandColor}
        style={{ userSelect: "none" }}
      >
        Fi
      </text>
    </svg>
  );
};

export default Logo;
