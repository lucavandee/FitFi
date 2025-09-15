// src/components/ai/NovaHealthChip.tsx
import React from "react";

type Status = "ok" | "warn" | "error";
type Props = { status: Status; label?: string; className?: string };

const mapBadge = (status: Status) => {
  switch (status) {
    case "ok":
      return "badge badge-success";
    case "warn":
      return "badge badge-warn";
    case "error":
    default:
      return "badge badge-danger";
  }
};

const mapText = (status: Status, label?: string) => {
  if (label) return label;
  if (status === "ok") return "Online";
  if (status === "warn") return "Vertraagd";
  return "Storing";
};

const NovaHealthChip: React.FC<Props> = ({ status, label, className }) => {
  return (
    <span className={`${mapBadge(status)} text-xs ${className || ""}`} role="status" aria-live="polite">
      {mapText(status, label)}
    </span>
  );
};

export default NovaHealthChip;