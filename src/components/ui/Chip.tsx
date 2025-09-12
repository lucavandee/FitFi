import React from "react";

type Props = {
  children: React.ReactNode;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
};

export default function Chip({ children, selected, onClick, className = "" }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`ff-chip ${selected ? "outline outline-2 outline-[var(--fitfi-primary)]" : ""} ${className}`}
    >
      {children}
    </button>
  );
}