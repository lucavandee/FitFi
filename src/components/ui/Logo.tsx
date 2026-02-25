import React from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "default" | "light" | "dark";
  className?: string;
}

/**
 * FitFi Premium Wordmark
 *
 * Mark: een abstracte "hanger" — de boog van een kledingshanger
 * gecombineerd met een slanke neergaande lijn. Leest als stijl,
 * kleding, en de letter F tegelijk. Volledig uniek en schaalbaar.
 *
 * Wordmark: "FitFi" — "Fit" in donker, "Fi" in brand-taupe,
 * ruim letter-spacing voor een premium gevoel.
 */
const Logo: React.FC<LogoProps> = ({
  size = "md",
  variant = "default",
  className = "",
}) => {
  const scale: Record<string, number> = { sm: 0.75, md: 1, lg: 1.3 };
  const s = scale[size];

  const markW = Math.round(32 * s);
  const markH = Math.round(36 * s);
  const gap = Math.round(10 * s);
  const fontSize = Math.round(18 * s);
  const totalW = markW + gap + Math.round(fontSize * 3.6);
  const totalH = markH;

  const textY = Math.round(markH * 0.72);

  const wordFill =
    variant === "light"
      ? "#FFFFFF"
      : variant === "dark"
      ? "#1E2333"
      : "var(--color-text)";

  const strokeMain =
    variant === "light"
      ? "rgba(255,255,255,0.95)"
      : "var(--ff-color-primary-700)";

  const strokeAccent =
    variant === "light"
      ? "rgba(255,255,255,0.6)"
      : "var(--ff-color-primary-500)";

  const sw = Math.round(2.2 * s);
  const cx = markW / 2;

  return (
    <svg
      width={totalW}
      height={totalH}
      viewBox={`0 0 ${totalW} ${totalH}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="FitFi"
      role="img"
    >
      <defs>
        <linearGradient id="ff-mark-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--ff-color-primary-600)" />
          <stop offset="100%" stopColor="var(--ff-color-primary-800)" />
        </linearGradient>
      </defs>

      {/*
        MARK — kledingshanger silhouet
        ─────────────────────────────
        1. Haak bovenin: klein cirkelboogje
        2. Brede V-boog die de schouders van een hanger vormt
        3. Korte horizontale balk onderaan (de onderkant van hanger)
        De combinatie leest als "hanger" én als abstracte F/stijl-mark.
      */}

      {/* Haak — kleine boog bovenin */}
      <path
        d={`M ${cx} ${Math.round(2 * s)}
            a ${Math.round(4 * s)} ${Math.round(4 * s)} 0 0 1 ${Math.round(4 * s)} ${Math.round(4 * s)}`}
        stroke={strokeMain}
        strokeWidth={sw}
        strokeLinecap="round"
        fill="none"
      />

      {/* Schouder-boog — breed V */}
      <path
        d={`M ${Math.round(2 * s)} ${Math.round(26 * s)}
            Q ${cx} ${Math.round(8 * s)} ${Math.round((markW - 2) * s)} ${Math.round(26 * s)}`}
        stroke={strokeMain}
        strokeWidth={sw}
        strokeLinecap="round"
        fill="none"
      />

      {/* Horizontale onderbalk */}
      <line
        x1={Math.round(2 * s)}
        y1={Math.round(33 * s)}
        x2={Math.round((markW - 2) * s)}
        y2={Math.round(33 * s)}
        stroke={strokeAccent}
        strokeWidth={Math.round(sw * 0.85)}
        strokeLinecap="round"
      />

      {/* Verbindingslijn van boog naar balk */}
      <line
        x1={Math.round(2 * s)}
        y1={Math.round(26 * s)}
        x2={Math.round(2 * s)}
        y2={Math.round(33 * s)}
        stroke={strokeAccent}
        strokeWidth={Math.round(sw * 0.85)}
        strokeLinecap="round"
      />
      <line
        x1={Math.round((markW - 2) * s)}
        y1={Math.round(26 * s)}
        x2={Math.round((markW - 2) * s)}
        y2={Math.round(33 * s)}
        stroke={strokeAccent}
        strokeWidth={Math.round(sw * 0.85)}
        strokeLinecap="round"
      />

      {/* ── WORDMARK ── */}
      <text
        x={markW + gap}
        y={textY}
        fontFamily="'Montserrat', 'Inter', system-ui, sans-serif"
        fontWeight="700"
        fontSize={fontSize}
        letterSpacing="0.5"
        fill={wordFill}
      >
        Fit
      </text>
      <text
        x={markW + gap + Math.round(fontSize * 1.8)}
        y={textY}
        fontFamily="'Montserrat', 'Inter', system-ui, sans-serif"
        fontWeight="700"
        fontSize={fontSize}
        letterSpacing="0.5"
        fill="var(--ff-color-primary-600)"
      >
        Fi
      </text>

      {/* Subtiele punt — premium detail */}
      <circle
        cx={markW + gap + Math.round(fontSize * 3.45)}
        cy={Math.round(textY - fontSize * 0.72)}
        r={Math.round(1.8 * s)}
        fill="var(--ff-color-primary-500)"
      />
    </svg>
  );
};

export default Logo;
