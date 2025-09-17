import React from "react";
import { twMerge } from "tailwind-merge";

/**
 * Tokens-first Card
 * - Cards: bg --color-surface, border --color-border, shadow --shadow-soft, radius --radius-lg
 * - A11y: semantic <article> by default, overridable via as="div" | "section"
 */

type AsElement = "article" | "section" | "div";

export interface CardProps extends React.HTMLAttributes<HTMLElement> {
  as?: AsElement;
}

function cn(...cls: Array<string | false | null | undefined>) {
  return twMerge(cls.filter(Boolean).join(" "));
}

const base =
  "bg-[color:var(--color-surface)] border border-[color:var(--color-border)] " +
  "rounded-[var(--radius-lg)] shadow-[var(--shadow-soft)]";

const Card: React.FC<CardProps> = ({ as = "article", className, ...props }) => {
  const Comp = as as unknown as React.ElementType;
  return <Comp className={cn(base, className)} {...props} />;
};

export default Card;