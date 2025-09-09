import React from "react";
import { cn } from "@/utils/cn";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "outlined";
  padding?: "none" | "sm" | "md" | "lg";
}

const variants = {
  default: "bg-surface border border-border",
  elevated: "bg-surface shadow-md border border-border",
  outlined: "bg-transparent border-2 border-border"
};

const paddings = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8"
};

export default function Card({ 
  className, 
  variant = "default", 
  padding = "md", 
  children, 
  ...props 
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-md transition-colors duration-150",
        variants[variant],
        paddings[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}