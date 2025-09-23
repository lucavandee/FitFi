// src/components/outfits/ExplainBadge.tsx
import React from "react";

/**
 * ExplainBadge — kleine uitleg-badge (bijv. "Kleurharmonie", "Silhouet", "Materiaal").
 * - Tokens-first, geen hex; gebruikt ff-chip utilities.
 * - API: <ExplainBadge>Label</ExplainBadge>
 */
type Props = React.HTMLAttributes<HTMLSpanElement>;

export default function ExplainBadge({ className, children, ...rest }: Props) {
  return (
    <span
      className={["ff-chip text-xs", className].filter(Boolean).join(" ")}
      {...rest}
    >
      {children}
    </span>
  );
}