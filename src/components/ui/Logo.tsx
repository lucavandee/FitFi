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
  const scale: Record<string, number> = { sm: 0.65, md: 1, lg: 1.45 };
  const s = scale[size];

  const primary =
    variant === "light"
      ? "#FFFFFF"
      : variant === "dark"
      ? "#1E2333"
      : "var(--color-text)";

  const accent =
    variant === "light"
      ? "rgba(255,255,255,0.55)"
      : "var(--ff-color-primary-600)";

  const dot =
    variant === "light"
      ? "rgba(255,255,255,0.80)"
      : "var(--ff-color-primary-500)";

  const W = Math.round(88 * s);
  const H = Math.round(28 * s);

  return (
    <svg
      width={W}
      height={H}
      viewBox="0 0 88 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="FitFi"
      role="img"
      style={{ display: "block", overflow: "visible" }}
    >
      {/* ─── F ─── */}
      <rect x="0" y="2" width="2.8" height="22" rx="1.2" fill={primary} />
      <rect x="0" y="2" width="13" height="2.8" rx="1.2" fill={primary} />
      <rect x="0" y="12.6" width="10" height="2.6" rx="1.2" fill={primary} />

      {/* ─── i ─── */}
      <rect x="17" y="7" width="2.8" height="17" rx="1.2" fill={primary} />
      <circle cx="18.4" cy="3.4" r="1.9" fill={dot} />

      {/* ─── t ─── */}
      <rect x="24" y="2" width="2.8" height="22" rx="1.2" fill={primary} />
      <rect x="20.5" y="7" width="9.5" height="2.6" rx="1.2" fill={primary} />

      {/* ─── thin divider ─── */}
      <rect x="34" y="6" width="1.2" height="16" rx="0.6" fill={accent} opacity="0.45" />

      {/* ─── F (accent) ─── */}
      <rect x="39" y="2" width="2.8" height="22" rx="1.2" fill={accent} />
      <rect x="39" y="2" width="13" height="2.8" rx="1.2" fill={accent} />
      <rect x="39" y="12.6" width="10" height="2.6" rx="1.2" fill={accent} />

      {/* ─── i (accent) ─── */}
      <rect x="56" y="7" width="2.8" height="17" rx="1.2" fill={accent} />
      <circle cx="57.4" cy="3.4" r="1.9" fill={dot} />
    </svg>
  );
};

export default Logo;
