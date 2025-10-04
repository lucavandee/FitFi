import React from "react";
import { ShieldCheck, LockKeyhole, CircleCheck as CheckCircle2 } from "lucide-react";

/**
 * A horizontal belt of trust and privacy badges. Each badge combines
 * a simple icon with a short label to reassure visitors that FitFi
 * respects their data and complies with relevant regulations. The
 * component is lightweight and token‑driven: all colours come from
 * CSS variables defined in the design system, so the belt adapts
 * automatically in dark mode and across themes. Icons inherit a
 * consistent stroke width to align with the rest of the UI.
 */
const TRUST_ITEMS = [
  {
    icon: ShieldCheck,
    label: "Privacy‑first",
  },
  {
    icon: LockKeyhole,
    label: "AVG‑compliant",
  },
  {
    icon: CheckCircle2,
    label: "Geverifieerde partners",
  },
];
import Container from '../layout/Container';

const TrustBelt: React.FC = () => {
  return (
    <div
      aria-label="Vertrouwen badges"
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "0.5rem 0.75rem",
        marginTop: "0.75rem",
      }}
    >
      {TRUST_ITEMS.map(({ icon: Icon, label }, index) => (
        <span
          key={index}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            padding: "0.35rem 0.6rem",
            borderRadius: "9999px",
            background: "color-mix(in oklab, var(--ff-color-accent) 8%, var(--ff-color-surface))",
            border: "1px solid var(--ff-color-border)",
            fontSize: "0.8rem",
            fontWeight: 500,
            color: "var(--ff-color-text)",
          }}
        >
          <Icon size={16} strokeWidth={1.8} aria-hidden style={{ color: "var(--ff-color-primary)" }} />
          <span>{label}</span>
        </span>
      ))}
    </div>
  );
};

export default TrustBelt;