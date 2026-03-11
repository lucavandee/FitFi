import React from "react";
import { twMerge } from "tailwind-merge";

type Size = "sm" | "md" | "lg";

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: Size;
  label: string;
}

const sizeClasses: Record<Size, string> = {
  sm: "w-9 h-9 min-w-[36px] min-h-[36px]",
  md: "w-11 h-11 min-w-[44px] min-h-[44px]",
  lg: "w-12 h-12 min-w-[48px] min-h-[48px]",
};

export function IconButton({
  size = "md",
  label,
  className,
  children,
  ...props
}: IconButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-full shrink-0 " +
    "border border-[rgba(30,35,51,0.16)] bg-[rgba(255,255,255,0.72)] " +
    "text-[var(--color-text)] " +
    "transition-all duration-200 " +
    "hover:bg-[var(--ff-color-primary-50)] " +
    "hover:text-[var(--ff-color-primary-700)] " +
    "hover:border-[var(--ff-color-primary-400)] " +
    "focus-visible:outline-none focus-visible:ring-2 " +
    "focus-visible:ring-[var(--ff-color-primary-600)] focus-visible:ring-offset-2 " +
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none";

  return (
    <button
      type="button"
      aria-label={label}
      className={twMerge(base, sizeClasses[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}
