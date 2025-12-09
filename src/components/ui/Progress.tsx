import React from "react";
import { cn } from "@/utils/cn";

type Props = { value: number; className?: string; label?: string };

function Progress({ value, className, label }: Props) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("w-full", className)}>
      {label ? <div className="mb-1 text-sm text-muted">{label}</div> : null}
      <div className="h-2 rounded-sm bg-[var(--ff-ink-600)] overflow-hidden">
        <div
          className="h-full bg-primary transition-[width] duration-300"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={v}
          style={{ width: `${v}%` }}
        />
      </div>
    </div>
  );
}

export default Progress;