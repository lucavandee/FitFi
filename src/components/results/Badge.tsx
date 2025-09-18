import React from "react";

type Tone = "season" | "temp" | "arch" | "neutral";

const Badge: React.FC<{ tone?: Tone; children: React.ReactNode }> = ({ tone = "neutral", children }) => {
  const toneCls =
    tone === "season"
      ? "badge-season"
      : tone === "temp"
      ? "badge-temp"
      : tone === "arch"
      ? "badge-arch"
      : "badge-neutral";

  return <span className={`badge ${toneCls}`}>{children}</span>;
};

export default Badge;