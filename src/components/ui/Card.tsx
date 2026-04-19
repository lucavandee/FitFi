import React from "react";
import { twMerge } from "tailwind-merge";

/**
 * Tokens-first Card
 * - bg --color-surface, border --color-border, shadow --shadow-soft, radius --radius-lg
 */

type AsElement = "article" | "section" | "div";

export interface CardProps extends React.HTMLAttributes<HTMLElement> {
  as?: AsElement;
}

function cn(...cls: Array<string | false | null | undefined>) {
  return twMerge(cls.filter(Boolean).join(" "));
}

const base =
  "bg-[color:#FFFFFF] border border-[color:#E5E5E5] " +
  "rounded-2xl shadow-sm";

const Card: React.FC<CardProps> = ({ as = "article", className, ...props }) => {
  const Comp = as as unknown as React.ElementType;
  return <Comp className={cn(base, className)} {...props} />;
};

export default Card;