import React from "react";

type Variant = "primary" | "ghost" | "danger" | "success";
type Size = "sm" | "md" | "lg";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
};

const BASE =
  "inline-flex select-none items-center justify-center rounded-[var(--radius-lg)] border transition-colors " +
  "focus-visible:outline-none focus-visible:ring-2 ring-brand ring-offset-2 ring-offset-surface " +
  "disabled:opacity-60 disabled:cursor-not-allowed";

const VARIANTS: Record<Variant, string> = {
  // Primaire CTA (solid): bg --ff-color-primary-700, text = surface (wit), hover = --ff-color-primary-600
  primary:
    "bg-[color:var(--ff-color-primary-700)] text-[color:var(--color-surface)] border-transparent " +
    "hover:bg-[color:var(--ff-color-primary-600)]",

  // Secundair (ghost): transparant, border = --color-border, tekst = --color-text, hover border = --color-primary
  ghost:
    "bg-transparent text-[color:var(--color-text)] border-[color:var(--color-border)] " +
    "hover:border-[color:var(--color-primary)]",

  // Statusvarianten, netjes via tokens
  danger:
    "bg-[color:var(--color-danger)] text-[color:var(--color-surface)] border-transparent hover:opacity-90",
  success:
    "bg-[color:var(--color-success)] text-[color:var(--color-surface)] border-transparent hover:opacity-90",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-base",
  lg: "h-12 px-6 text-lg",
};

export default function Button({
  variant = "primary",
  size = "md",
  icon,
  iconPosition = "left",
  className = "",
  children,
  ...rest
}: Props) {
  return (
    <button
      className={`${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...rest}
    >
      {icon && iconPosition === "left" && <span className="mr-2">{icon}</span>}
      <span>{children}</span>
      {icon && iconPosition === "right" && <span className="ml-2">{icon}</span>}
    </button>
  );
}