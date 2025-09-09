import React from "react";
import { cn } from "@/utils/cn";

interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "primary" | "success" | "warning" | "danger";
  size?: "sm" | "md";
  removable?: boolean;
  onRemove?: () => void;
}

const variants = {
  default: "bg-surface text-text border border-border",
  primary: "bg-primary/10 text-primary border border-primary/20",
  success: "bg-success/10 text-success border border-success/20",
  warning: "bg-warning/10 text-warning border border-warning/20",
  danger: "bg-danger/10 text-danger border border-danger/20"
};

const sizes = {
  sm: "px-2 py-1 text-xs rounded-sm",
  md: "px-3 py-1.5 text-sm rounded-md"
};

export default function Chip({ 
  className, 
  variant = "default", 
  size = "md", 
  removable = false,
  onRemove,
  children, 
  ...props 
}: ChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-medium transition-colors duration-150",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      <span>{children}</span>
      {removable && onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-1 hover:opacity-70 focus:outline-none focus:ring-1 focus:ring-primary/40 rounded-sm"
          aria-label="Verwijderen"
        >
          ×
        </button>
      )}
    </span>
  );
}