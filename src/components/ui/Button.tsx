import React, { ElementType } from "react";
import cn from "@/utils/cn";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

interface BaseProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children?: React.ReactNode;
}

type Polymorphic<C extends ElementType> = {
  as?: C;
} & Omit<React.ComponentPropsWithoutRef<C>, "as"> &
  BaseProps;

export default function Button<C extends ElementType = "button">(
  props: Polymorphic<C>
) {
  const {
    as,
    className,
    variant = "primary",
    size = "md",
    children,
    ...rest
  } = props as Polymorphic<ElementType>;
  const Comp: any = as || "button";

  const v =
    variant === "primary"
      ? "bg-[color:var(--ff-turquoise)] text-[color:var(--ff-midnight)] hover:opacity-90"
      : variant === "secondary"
      ? "bg-white border border-black/10 hover:bg-[color:var(--ff-surface)]"
      : "bg-transparent hover:bg-black/5";
  const s =
    size === "sm"
      ? "text-sm px-3 py-1.5 rounded-xl"
      : size === "lg"
      ? "text-base px-5 py-3 rounded-2xl"
      : "text-sm px-4 py-2 rounded-2xl";

  return (
    <Comp className={cn(v, s, "font-semibold transition", className)} {...rest}>
      {children}
    </Comp>
  );
}