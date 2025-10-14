// src/components/ui/PremiumChip.tsx
import React from "react";

/**
 * PremiumChip
 * - Tokens-first; gebruikt ff-chip utilities.
 * - API: <PremiumChip active className>children</PremiumChip>
 * - Vangt extra props door naar <span>.
 */
type Props = React.HTMLAttributes<HTMLSpanElement> & {
  active?: boolean;
};

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export default function PremiumChip({ active = false, className, children, ...rest }: Props) {
  return (
    <span
      className={cx("ff-chip text-sm", active && "ff-chip--active", className)}
      {...rest}
    >
      {children}
    </span>
  );
}