import React from "react";

type Variant = "default" | "fitfi";

interface GradientWordProps {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
  gradient?: string;
}

export default function GradientWord({ 
  children, 
  variant = "default",
  className = "",
  gradient = 'from-blue-600 to-purple-600'
}: GradientWordProps) {
  // Input hardening - ensure children is string-like
  const textContent = typeof children === 'string' ? children : String(children || '');
  
  // Shared gradient stops (ink ↔ turquoise)
  const grad =
    variant === "fitfi"
      ? "linear-gradient(90deg,#0D1B2A 0%,#9ED9FF 36%,#0D1B2A 100%)"
      : "linear-gradient(90deg,#0D1B2A 0%,#89CFF0 48%,#0D1B2A 100%)";

  const style: React.CSSProperties = {
    backgroundImage: grad,
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    WebkitTextFillColor: "transparent",
    color: "transparent",
    // Zorg dat inline spans nooit "kleiner/grijzer" worden:
    font: "inherit",
    lineHeight: "inherit",
    letterSpacing: "inherit",
    display: "inline",
  };

  // Fallback for browsers without background-clip support
  const fallbackStyle: React.CSSProperties = {
    color: variant === "fitfi" ? "#9ED9FF" : "#89CFF0",
    font: "inherit",
    lineHeight: "inherit",
    letterSpacing: "inherit",
    display: "inline",
  };

  return (
    <>
      <span
        className={`bg-gradient-to-r ${gradient} bg-clip-text text-transparent font-bold ${className}`}
      >
      <span
        className={`hidden supports-[background-clip:text]:inline ${className}`}
        style={style}
      >
        {children}
      </span>

      {/* Fallback for older browsers */}
      <span
        className={`supports-[background-clip:text]:hidden ${className}`}
        style={fallbackStyle}
      >
        {children}
      </span>
      </span>
      {textContent}
    </>
  );
}
