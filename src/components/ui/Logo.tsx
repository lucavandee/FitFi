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
  const fontSize: Record<string, number> = { sm: 15, md: 20, lg: 27 };
  const fs = fontSize[size];
  const ls = 0.04 * fs;

  const fitFill =
    variant === "light"
      ? "#FFFFFF"
      : variant === "dark"
      ? "#1E2333"
      : "var(--color-text)";

  const fiFill =
    variant === "light"
      ? "rgba(255,255,255,0.55)"
      : "var(--ff-color-primary-500)";

  const fitW = fs * 2.08;
  const fiW = fs * 1.32;
  const totalW = Math.ceil(fitW + fiW + ls * 2);
  const totalH = Math.ceil(fs * 1.25);
  const baseline = Math.ceil(fs);

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
      <text
        x={0}
        y={baseline}
        fontFamily="'Montserrat', 'Inter', system-ui, sans-serif"
        fontWeight="700"
        fontSize={fs}
        letterSpacing={ls}
        fill={fitFill}
      >
        Fit
      </text>
      <text
        x={fitW}
        y={baseline}
        fontFamily="'Montserrat', 'Inter', system-ui, sans-serif"
        fontWeight="300"
        fontSize={fs}
        letterSpacing={ls}
        fill={fiFill}
      >
        Fi
      </text>
    </svg>
  );
};

export default Logo;
