import React, { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

type ButtonVariant = "primary" | "ghost" | "outline";
type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const base =
  "inline-flex items-center justify-center rounded-2xl font-medium transition-all " +
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 " +
  "focus-visible:ring-[var(--shadow-ring)] disabled:opacity-50 disabled:cursor-not-allowed";

const variants: Record<ButtonVariant, string> = {
  // Gebruik een robuuste CSS-class die via polish.css een fallback-keten opzet.
  primary: "btn-primary",
    "bg-transparent border border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-primary)]",
  outline:
    "border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-surface)]",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-base",
  lg: "h-12 px-6 text-base",
};

function cn(...cls: Array<string | false | null | undefined>) {
  return twMerge(cls.filter(Boolean).join(" "));
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", size = "md", type = "button", ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
});

export default Button;