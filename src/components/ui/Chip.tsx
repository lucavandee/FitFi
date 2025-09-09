import React from "react";
import { cn } from "@/utils/cn";

type ChipProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: "neutral" | "accent" | "success" | "warning" | "danger";
};

const tones = {
  neutral: "bg-[#1b2138] text-text border border-border",
  accent: "bg-accent/15 text-accent",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  danger: "bg-danger/15 text-danger"
};

function Chip({ className, tone = "neutral", ...rest }: ChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm px-2.5 py-1 text-sm font-medium",
        tones[tone],
        className
      )}
      {...rest}
    />
  );
}

export default Chip;