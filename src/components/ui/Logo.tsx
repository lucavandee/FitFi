import React from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "default" | "light" | "dark";
  className?: string;
}

const Logo: React.FC<LogoProps> = ({
  size = "md",
  variant = "default",
  className = "",
}) => {
  const heights: Record<string, number> = { sm: 28, md: 34, lg: 44 };
  const h = heights[size];
  const markSize = h;
  const gap = Math.round(h * 0.35);
  const textH = Math.round(h * 0.52);

  const textFill =
    variant === "light"
      ? "#FFFFFF"
      : variant === "dark"
      ? "#1E2333"
      : "var(--color-text)";

  const subtextFill =
    variant === "light"
      ? "rgba(255,255,255,0.65)"
      : "var(--color-muted)";

  const totalW = markSize + gap + Math.round(h * 3.2);

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
    >
      {/* ── Mark: warme F-monogram pill ── */}
      <rect
        x="0"
        y="0"
        width={markSize}
        height={markSize}
        rx={Math.round(markSize * 0.28)}
        fill="var(--ff-color-primary-700)"
      />
      {/* subtiele glans overlay */}
      <rect
        x="0"
        y="0"
        width={markSize}
        height={Math.round(markSize * 0.5)}
        rx={Math.round(markSize * 0.28)}
        fill="url(#logo-shine)"
        opacity="0.18"
      />

      {/* F-letterform — clean geometric */}
      {(() => {
        const pad = Math.round(markSize * 0.22);
        const sw = Math.round(markSize * 0.13);
        const inner = markSize - pad * 2;
        const mid = pad + Math.round(inner * 0.52);
        const midW = Math.round(inner * 0.68);
        const r = Math.round(sw * 0.4);
        return (
          <>
            {/* Verticale stam */}
            <rect
              x={pad}
              y={pad}
              width={sw}
              height={inner}
              rx={r}
              fill="white"
            />
            {/* Bovenste horizontaal — vol breed */}
            <rect
              x={pad}
              y={pad}
              width={inner}
              height={sw}
              rx={r}
              fill="white"
            />
            {/* Midden horizontaal — korter */}
            <rect
              x={pad}
              y={mid}
              width={midW}
              height={sw}
              rx={r}
              fill="white"
              opacity="0.88"
            />
          </>
        );
      })()}

      <defs>
        <linearGradient id="logo-shine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity="1" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* ── Wordmark ── */}
      <text
        x={markSize + gap}
        y={Math.round(h * 0.72)}
        fontFamily="'Montserrat', 'Inter', sans-serif"
        fontWeight="700"
        fontSize={textH}
        letterSpacing="-0.5"
        fill={textFill}
      >
        Fit
        <tspan fill="var(--ff-color-primary-600)">Fi</tspan>
      </text>

      {/* ── Tagline dot ── */}
      <circle
        cx={markSize + gap + Math.round(h * 3.12)}
        cy={Math.round(h * 0.2)}
        r={Math.round(h * 0.07)}
        fill="var(--ff-color-primary-500)"
        opacity="0.7"
      />
    </svg>
  );
};

export default Logo;
