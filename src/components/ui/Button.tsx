import React, { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

/**
 * Tokens-first Button
 * - Primary (solid): bg var(--ff-color-primary-700), hover var(--ff-color-primary-600), text white
 * - Ghost (secondary): transparent bg, border var(--color-border), text var(--color-text), hover border var(--color-primary)
 * - Outline: border + subtle hover on surface
 * - Focus ring via tokens
 * - Sizes: sm, md, lg
 */

type ButtonVariant = "primary" | "ghost" | "outline";
type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const base =
  "inline-flex items-center justify-center rounded-2xl font-medium transition-all " +
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 " +
  "focus-visible:ring-[color:var(--shadow-ring)] disabled:opacity-50 disabled:cursor-not-allowed";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-[color:var(--ff-color-primary-700)] text-white " +
    "hover:bg-[color:var(--ff-color-primary-600)]",
  ghost:
    "bg-transparent border border-[color:var(--color-border)] " +
    "text-[color:var(--color-text)] hover:border-[color:var(--color-primary)]",
  outline:
    "border border-[color:var(--color-border)] text-[color:var(--color-text)] " +
    "hover:bg-[color:var(--color-surface)]",
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