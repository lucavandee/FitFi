import React from "react";

type Billing = "monthly" | "yearly";

const PlanToggle: React.FC<{
  value: Billing;
  onChange: (v: Billing) => void;
  note?: string;
}> = ({ value, onChange, note }) => {
  return (
    <div className="plan-toggle" role="tablist" aria-label="Facturering">
      <button
        role="tab"
        aria-selected={value === "monthly"}
        className={`plan-toggle-btn ${value === "monthly" ? "is-active" : ""}`}
        onClick={() => onChange("monthly")}
        aria-controls="pricing-grid"
      >
        Maandelijks
      </button>
      <button
        role="tab"
        aria-selected={value === "yearly"}
        className={`plan-toggle-btn ${value === "yearly" ? "is-active" : ""}`}
        onClick={() => onChange("yearly")}
        aria-controls="pricing-grid"
      >
        Jaarlijks
      </button>
      {note ? <span className="plan-toggle-note">{note}</span> : null}
    </div>
  );
};

export default PlanToggle;