import React, { ElementType, forwardRef } from "react";
import { cn } from "@/utils/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "outline" | "danger";
type ButtonSize = "sm" | "md" | "lg";

type Props<T extends ElementType> = {
  as?: T;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
} & Omit<React.ComponentPropsWithoutRef<T>, "as" | "size">;

const variants: Record<ButtonVariant, string> = {
  primary: "bg-primary text-white hover:bg-primary-600 focus:ring-2 focus:ring-primary/40",
  secondary: "bg-surface text-text border border-border hover:bg-[#1b1f35] focus:ring-2 focus:ring-primary/20",
  ghost: "bg-transparent text-text hover:bg-[#1b1f35] focus:ring-2 focus:ring-primary/20",
  outline: "bg-transparent text-text border border-border hover:bg-[#1b1f35] focus:ring-2 focus:ring-primary/20",
  danger: "bg-danger text-white hover:opacity-90 focus:ring-2 focus:ring-danger/40"
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm rounded-sm",
  md: "h-11 px-4 text-base rounded-md",
  lg: "h-12 px-6 text-md rounded-lg"
};

function _Button<T extends ElementType = "button">(
  { as, className, variant = "primary", size = "md", loading = false, children, ...rest }: Props<T>,
  ref: React.Ref<any>
) {
  const Comp: ElementType = as ?? "button";
  return (
    <Comp
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 transition-colors duration-150 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed shadow-sm",
        variants[variant],
        sizes[size],
        className
      )}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? (
        <span className="animate-pulse" aria-hidden>
          •••
        </span>
      ) : null}
      <span>{children}</span>
    </Comp>
  );
}

const Button = forwardRef(_Button) as <T extends ElementType = "button">(p: Props<T> & { ref?: React.Ref<any> }) => JSX.Element;
export default Button;