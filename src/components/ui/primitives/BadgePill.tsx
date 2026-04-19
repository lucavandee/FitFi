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
    "bg-[color-mix(in_oklab,#FFFFFF_92%,white)] " +
    "border-[#E5E5E5] text-[#1A1A1A]",
  soft:
    "bg-[color-mix(in_oklab,#C2654A_12%,white)] " +
    "border-[#E5E5E5] text-[#1A1A1A]",
  season:
    "bg-[color-mix(in_oklab,#C2654A_15%,white)] " +
    "border-[color-mix(in_oklab,#C2654A_25%,#E5E5E5)] " +
    "text-[#1A1A1A]",
  arch:
    "bg-[color-mix(in_oklab,#1A1A1A_8%,white)] " +
    "border-[color-mix(in_oklab,#1A1A1A_15%,#E5E5E5)] " +
    "text-[#1A1A1A]",
  success:
    "bg-[#F4E8E3] " +
    "border-[#E5E5E5] " +
    "text-[#C2654A]",
  warning:
    "bg-[#FFFBEB] " +
    "border-[#FDE68A] " +
    "text-[#B06020]",
  danger:
    "bg-[#FEF2F2] " +
    "border-[#FECACA] " +
    "text-[#9A2020]",
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
