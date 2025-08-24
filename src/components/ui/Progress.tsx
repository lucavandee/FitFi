import React from "react";

type Props = {
  value: number; // 0..1
  label?: string;
  className?: string;
};

export default function Progress({ value, label, className }: Props) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div className={`w-full ${className ?? ""}`}>
      {label && <div className="text-xs text-gray-500 mb-1">{label}</div>}
      <div className="h-2 w-full rounded-full bg-gray-100">
        <div
          className="h-2 rounded-full transition-all"
          style={{
            width: `${pct}%`,
            background:
              "linear-gradient(90deg, var(--ff-grad-midnight) 0%, var(--ff-sky-500) 100%)",
          }}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pct)}
          role="progressbar"
        />
      </div>
    </div>
  );
}
