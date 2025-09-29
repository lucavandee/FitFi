import React from "react";
import { ShieldCheck, LockKeyhole, CheckCircle2 } from "lucide-react";

/**
 * Smalle belt met vertrouwens-badges.
 * Volledig token-gedreven; inline styles gebruiken CSS-variabelen uit tokens.css.
 */
const ITEMS = [
  { icon: ShieldCheck, label: "Privacy-first" },
  { icon: LockKeyhole, label: "AVG-compliant" },
  { icon: CheckCircle2, label: "Geverifieerde partners" },
];

export default function TrustBelt() {
  return (
    <div
      aria-label="Vertrouwensbadges"
      style={{
        display: "grid",
        gap: "0.5rem",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        marginTop: "0.75rem",
      }}
    >
      {ITEMS.map(({ icon: Icon, label }) => (
        <span
          key={label}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.5rem 0.75rem",
            borderRadius: "9999px",
            border: "1px solid var(--color-border)",
            background:
              "color-mix(in oklab, var(--color-accent) 10%, var(--color-surface))",
            color: "var(--color-text)",
            fontSize: ".875rem",
            fontWeight: 600,
            justifyContent: "center",
          }}
        >
          <Icon size={16} strokeWidth={1.8} aria-hidden />
          <span>{label}</span>
        </span>
      ))}
    </div>
  );
}