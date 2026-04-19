import React from "react";
import { twMerge } from "tailwind-merge";

type HeadingLevel = "h1" | "h2" | "h3" | "h4";
type Size = "sm" | "md" | "lg";

interface ProductSectionHeaderProps {
  title: string;
  subtitle?: string;
  as?: HeadingLevel;
  size?: Size;
  align?: "left" | "center";
  actions?: React.ReactNode;
  className?: string;
}

const titleSizeClasses: Record<Size, string> = {
  sm: "text-lg sm:text-xl",
  md: "text-xl sm:text-2xl",
  lg: "text-2xl sm:text-3xl",
};

export function ProductSectionHeader({
  title,
  subtitle,
  as = "h2",
  size = "md",
  align = "left",
  actions,
  className,
}: ProductSectionHeaderProps) {
  const Heading = as as React.ElementType;

  return (
    <div
      className={twMerge(
        "flex items-start gap-4",
        align === "center" ? "flex-col items-center text-center" : "flex-row justify-between",
        className
      )}
    >
      <div className={twMerge("flex flex-col gap-1", align === "center" ? "items-center" : "")}>
        <Heading
          className={twMerge(
            "font-semibold leading-tight text-[#1A1A1A]",
            titleSizeClasses[size]
          )}
        >
          {title}
        </Heading>
        {subtitle && (
          <p className="text-sm text-[#8A8A8A] leading-relaxed max-w-prose">
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
