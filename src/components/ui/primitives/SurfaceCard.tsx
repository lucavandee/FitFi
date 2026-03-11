import React from "react";
import { twMerge } from "tailwind-merge";

type As = "article" | "section" | "div" | "li";

interface SurfaceCardProps extends React.HTMLAttributes<HTMLElement> {
  as?: As;
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

const paddingClasses = {
  none: "",
  sm: "p-4",
  md: "p-4 sm:p-6",
  lg: "p-6 sm:p-8",
};

export function SurfaceCard({
  as = "div",
  hover = false,
  padding = "md",
  className,
  children,
  ...props
}: SurfaceCardProps) {
  const base =
    "bg-[var(--color-surface)] " +
    "rounded-2xl " +
    "border border-[var(--color-border)] " +
    "shadow-[var(--shadow-soft)]";

  const hoverClasses = hover
    ? "transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
    : "";

  const Component = as as React.ElementType;

  return (
    <Component
      className={twMerge(base, hoverClasses, paddingClasses[padding], className)}
      {...props}
    >
      {children}
    </Component>
  );
}
