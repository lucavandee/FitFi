import React, { ElementType, forwardRef } from "react";
import { cn } from "@/utils/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "outline" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

type BaseProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  className?: string;
  children?: React.ReactNode;
};

export type PolymorphicProps<T extends ElementType> = {
  as?: T;
} & BaseProps & Omit<React.ComponentPropsWithoutRef<T>, "as" | "size" | "color">;

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-[#2B6AF3] text-white hover:bg-[#1f56d6] focus:outline-none focus:ring-2 focus:ring-[#2B6AF3]/40 disabled:opacity-50 disabled:cursor-not-allowed",
  secondary:
    "bg-white text-[#0D1B2A] border border-black/10 hover:bg-black/5 disabled:opacity-50 disabled:cursor-not-allowed",
  ghost:
    "bg-transparent text-[#0D1B2A] hover:bg-black/5 disabled:opacity-50 disabled:cursor-not-allowed",
  outline:
    "bg-transparent text-[#0D1B2A] border border-black/10 hover:bg-black/5 disabled:opacity-50 disabled:cursor-not-allowed",
  danger:
    "bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400/40 disabled:opacity-50 disabled:cursor-not-allowed",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm rounded-xl",
  md: "h-10 px-4 text-sm rounded-2xl",
  lg: "h-12 px-5 text-base rounded-2xl",
};

const _Button = <T extends ElementType = "button">(
  {
    as,
    variant = "primary",
    size = "md",
    loading = false,
    icon,
    iconPosition = "left",
    className,
    children,
    ...rest
  }: PolymorphicProps<T>,
  ref: React.Ref<any>
) => {
  const Comp = (as || "button") as ElementType;

  return (
    <Comp
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
        variants[variant],
        sizes[size],
        className
      )}
      aria-busy={loading || undefined}
      {...(rest as any)}
    >
      {loading ? (
        <span className="animate-pulse" aria-hidden>
          ···
        </span>
      ) : null}
      {icon && iconPosition === "left" ? (
        <span className="mr-2 inline-flex items-center">{icon}</span>
      ) : null}
      <span className="truncate">{children}</span>
      {icon && iconPosition === "right" ? (
        <span className="ml-2 inline-flex items-center">{icon}</span>
      ) : null}
    </Comp>
  );
};

const Button = forwardRef(_Button) as <T extends ElementType = "button">(
  p: PolymorphicProps<T> & { ref?: React.Ref<any> }
) => JSX.Element;

export default Button;