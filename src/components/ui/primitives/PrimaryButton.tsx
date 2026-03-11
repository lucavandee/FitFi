import React from "react";
import { Loader2 } from "lucide-react";
import { twMerge } from "tailwind-merge";

type Size = "sm" | "md" | "lg";

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: Size;
  loading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

const sizeClasses: Record<Size, string> = {
  sm: "h-10 px-4 text-sm gap-1.5",
  md: "h-11 px-5 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2",
};

const iconSizeClasses: Record<Size, string> = {
  sm: "w-3.5 h-3.5",
  md: "w-4 h-4",
  lg: "w-5 h-5",
};

export function PrimaryButton({
  size = "md",
  loading = false,
  loadingText,
  icon,
  iconPosition = "left",
  className,
  children,
  disabled,
  ...props
}: PrimaryButtonProps) {
  const base =
    "inline-flex items-center justify-center font-medium rounded-xl " +
    "bg-[var(--ff-color-primary-700)] text-white " +
    "transition-all duration-200 " +
    "hover:bg-[var(--ff-color-primary-600)] " +
    "active:scale-[0.98] " +
    "focus-visible:outline-none focus-visible:ring-2 " +
    "focus-visible:ring-[var(--ff-color-primary-600)] focus-visible:ring-offset-2 " +
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none " +
    "shrink-0";

  const iconEl = loading ? (
    <Loader2 className={twMerge(iconSizeClasses[size], "animate-spin shrink-0")} />
  ) : icon ? (
    <span className={twMerge(iconSizeClasses[size], "shrink-0 flex items-center")}>{icon}</span>
  ) : null;

  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={twMerge(base, sizeClasses[size], className)}
      {...props}
    >
      {iconPosition === "left" && iconEl}
      <span>{loading && loadingText ? loadingText : children}</span>
      {iconPosition === "right" && iconEl}
    </button>
  );
}
