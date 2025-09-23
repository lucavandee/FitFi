// src/components/how/TestimonialCard.tsx
import React from "react";

type Props = {
  quote: string;
  author: string;
  role?: string;
  className?: string;
};

function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/**
 * TestimonialCard
 * - Tokens-first; gebruikt ff-card + typografie nuance.
 * - Toegankelijk: blockquote met <footer><cite>.
 */
export default function TestimonialCard({ quote, author, role, className }: Props) {
  return (
    <blockquote className={cx("ff-card p-5 ff-fade-in", className)}>
      <p className="text-base">&ldquo;{quote}&rdquo;</p>
      <footer className="mt-3 text-sm text-text/80">
        <cite className="not-italic font-medium">{author}</cite>
        {role ? <span className="ml-2">• {role}</span> : null}
      </footer>
    </blockquote>
  );
}