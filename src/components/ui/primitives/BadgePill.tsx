import React from "react";
import { twMerge } from "tailwind-merge";

type Variant = "neutral" | "soft" | "season" | "arch" | "success" | "warning" | "danger";

interface BadgePillProps {
  children: React.ReactNode;
  variant?: Variant;
  icon?: React.ReactNode;
  className?: string;
}

const variantClasses: Record<Variant, string> = {
  neutral:
    "bg-[color-mix(in_oklab,var(--color-surface)_92%,white)] " +
    "border-[var(--color-border)] text-[var(--color-text)]",
  soft:
    "bg-[color-mix(in_oklab,var(--color-accent)_12%,white)] " +
    "border-[var(--color-border)] text-[var(--color-text)]",
  season:
    "bg-[color-mix(in_oklab,var(--color-accent)_15%,white)] " +
    "border-[color-mix(in_oklab,var(--color-accent)_25%,var(--color-border))] " +
    "text-[var(--color-text)]",
  arch:
    "bg-[color-mix(in_oklab,var(--color-text)_8%,white)] " +
    "border-[color-mix(in_oklab,var(--color-text)_15%,var(--color-border))] " +
    "text-[var(--color-text)]",
  success:
    "bg-[var(--ff-color-success-50)] " +
    "border-[var(--ff-color-success-200)] " +
    "text-[var(--ff-color-success-700)]",
  warning:
    "bg-[var(--ff-color-warning-50)] " +
    "border-[var(--ff-color-warning-200)] " +
    "text-[var(--ff-color-warning-700)]",
  danger:
    "bg-[var(--ff-color-danger-50)] " +
    "border-[var(--ff-color-danger-200)] " +
    "text-[var(--ff-color-danger-700)]",
};

export function BadgePill({
  children,
  variant = "neutral",
  icon,
  className,
}: BadgePillProps) {
  return (
    <span
      className={twMerge(
        "inline-flex items-center gap-1 px-2 py-0.5 " +
          "rounded-full border text-xs font-medium leading-none",
        variantClasses[variant],
        className
      )}
    >
      {icon && <span className="w-3 h-3 shrink-0 flex items-center">{icon}</span>}
      {children}
    </span>
  );
}
