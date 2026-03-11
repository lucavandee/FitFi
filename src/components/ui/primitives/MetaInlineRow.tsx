import React from "react";
import { twMerge } from "tailwind-merge";

interface MetaItem {
  label: string;
  value?: string;
  pill?: boolean;
}

interface MetaInlineRowProps {
  items: MetaItem[];
  className?: string;
  separator?: string;
}

export function MetaInlineRow({
  items,
  className,
  separator = "·",
}: MetaInlineRowProps) {
  const visibleItems = items.filter((item) => item.label || item.value);

  return (
    <div
      className={twMerge(
        "flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-[var(--color-muted)]",
        className
      )}
    >
      {visibleItems.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <span className="select-none opacity-50" aria-hidden="true">
              {separator}
            </span>
          )}
          {item.pill ? (
            <span
              className={
                "inline-flex items-center px-2 py-0.5 rounded-full " +
                "border border-[var(--color-border)] " +
                "bg-[color-mix(in_oklab,var(--color-surface)_94%,var(--color-text)_6%)] " +
                "text-[var(--color-muted)] text-xs"
              }
            >
              {item.value ?? item.label}
            </span>
          ) : (
            <span>
              {item.label && item.value ? (
                <>
                  <span className="font-medium text-[var(--color-text-secondary)]">{item.label}:</span>{" "}
                  {item.value}
                </>
              ) : (
                item.value ?? item.label
              )}
            </span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
