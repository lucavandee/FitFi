import React from "react";

type Variant = "primary" | "ghost" | "danger" | "success";
type Size = "sm" | "md" | "lg";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
};

function classes(variant: Variant, size: Size, disabled?: boolean) {
  const base = "inline-flex items-center justify-center rounded-xl border transition-all focus-visible:outline-none";
  const sizes: Record<Size, string> = {
    sm: "h-9 px-3 text-sm",
    md: "h-11 px-4 text-[15px]",
    lg: "h-12 px-5 text-base",
  };
  const v: Record<Variant, string> = {
    primary:
      "bg-[var(--fitfi-primary)] border-white/10 text-white hover:translate-y-[-1px] hover:shadow-xl hover:shadow-[rgba(43,106,243,.35)] active:translate-y-0",
    ghost:
      "bg-transparent border-white/15 text-white hover:bg-white/10",
    danger:
      "bg-[var(--fitfi-danger)] border-white/10 text-white hover:brightness-110",
    success:
      "bg-[var(--fitfi-success)] border-white/10 text-white hover:brightness-110",
  };
  const state = disabled ? "opacity-60 cursor-not-allowed" : "";
  return `${base} ${sizes[size]} ${v[variant]} ${state}`;
}

export default function Button({
  variant = "primary",
  size = "md",
  leftIcon,
  rightIcon,
  disabled,
  className = "",
  children,
  ...rest
}: Props) {
  return (
    <button className={`${classes(variant, size, disabled)} ${className}`} disabled={disabled} {...rest}>
      {leftIcon && <span className="mr-2">{leftIcon}</span>}
      <span>{children}</span>
      {rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
}