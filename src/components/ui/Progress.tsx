import React from "react";
import { cn } from "@/utils/cn";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "success" | "warning" | "danger";
  showLabel?: boolean;
  label?: string;
}

const sizes = {
  sm: "h-1",
  md: "h-2",
  lg: "h-3"
};

const variants = {
  default: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger"
};

export default function Progress({ 
  className,
  value,
  max = 100,
  size = "md",
  variant = "default",
  showLabel = false,
  label,
  ...props 
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  return (
    <div className={cn("w-full", className)} {...props}>
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-text">{label}</span>
          <span className="text-sm text-muted">{Math.round(percentage)}%</span>
        </div>
      )}
      <div 
        className={cn(
          "w-full bg-border rounded-full overflow-hidden",
          sizes[size]
        )}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
      >
        <div
          className={cn(
            "h-full transition-all duration-300 ease-out rounded-full",
            variants[variant]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}