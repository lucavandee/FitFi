// src/components/how/StepCard.tsx
import React from "react";

type Props = {
  index: number;
  title: string;
  description: string;
  className?: string;
};

function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/**
 * StepCard
 * - Tokens-first, ff-utilities.
 * - Toegankelijk: semantisch <article>, headings met id/aria.
 */
export default function StepCard({ index, title, description, className }: Props) {
  const titleId = `stepcard-title-${index}`;
  return (
    <article className={cx("ff-card ff-hover-lift p-5 h-full", className)} aria-labelledby={titleId}>
      <div className="flex items-start gap-4">
        <div
          aria-hidden="true"
          className="shrink-0 grid place-items-center size-10 rounded-full border border-border"
          style={{ background: "color-mix(in oklab, var(--color-surface) 85%, var(--color-text))" }}
        >
          <span className="font-semibold">{index}</span>
        </div>
        <div className="min-w-0">
          <h3 id={titleId} className="font-heading text-lg leading-tight">{title}</h3>
          <p className="mt-1 text-sm text-text/80">{description}</p>
        </div>
      </div>
    </article>
  );
}