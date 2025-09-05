import clsx from "clsx";
import { ReactNode } from "react";

/**
 * GradientText – tekst met verloop (Tailwind v3).
 * 
 * Voorbeeld:
 * ```
 * <GradientText>AI die je stijl begrijpt</GradientText>
 * ```
 */
type Props = {
  children: ReactNode;
  className?: string;
  direction?: "r" | "l" | "t" | "b"; // right/left/top/bottom
  fromClass?: string; // bv. "from-accent"
  toClass?: string; // bv. "to-midnight"
};

function GradientText({
  children,
  className,
  direction = "r",
  fromClass = "from-accent",
  toClass = "to-midnight",
}: Props) {
  const dirClass =
    direction === "l"
      ? "bg-gradient-to-l"
      : direction === "t"
      ? "bg-gradient-to-t"
      : direction === "b"
      ? "bg-gradient-to-b"
      : "bg-gradient-to-r"; // default right

  return (
    <span
      className={clsx(
        "bg-clip-text text-transparent",
        dirClass,
        fromClass,
        toClass,
        className
      )}
    >
      {children}
    </span>
  );
}

export default GradientText;