import React from "react";

type Props = {
  value: "monthly" | "yearly";
  onChange: (value: "monthly" | "yearly") => void;
  note?: string;
};

const PlanToggle: React.FC<Props> = ({ value, onChange, note }) => {
  return (
    <div className="plan-toggle-wrap">
      <div className="plan-toggle" role="radiogroup" aria-label="Factureringsperiode">
        <button
          type="button"
          role="radio"
          aria-checked={value === "monthly"}
          className={`toggle-option ${value === "monthly" ? "active" : ""}`}
          onClick={() => onChange("monthly")}
        >
          Maandelijks
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={value === "yearly"}
          className={`toggle-option ${value === "yearly" ? "active" : ""}`}
          onClick={() => onChange("yearly")}
        >
          Jaarlijks
        </button>
      </div>
      {note && (
        <p className="toggle-note">
          {note}
        </p>
      )}
    </div>
  );
};

export default PlanToggle;