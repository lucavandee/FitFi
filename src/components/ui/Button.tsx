import { MouseEvent, ReactNode, ElementType, ComponentPropsWithoutRef } from "react";
import clsx from "clsx";

type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

type BaseProps = {
  children: ReactNode;
  className?: string;
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  disabled?: boolean;
  onClick?: (e: MouseEvent) => void;
  "data-track"?: string;
};

type PolymorphicProps<E extends ElementType> = BaseProps & {
  /** Render as another element/component, e.g. as={Link} or as="a" */
  as?: E;
} & Omit<ComponentPropsWithoutRef<E>, keyof BaseProps | "as">;

function Button<E extends ElementType = "button">(props: PolymorphicProps<E>) {
  const {
    children,
    className,
    variant = "primary",
    size = "md",
    fullWidth,
    disabled,
    onClick,
    "data-track": dataTrack,
    as,
    ...rest
  } = props as PolymorphicProps<any>;

  const classes = clsx(
    "inline-flex items-center justify-center gap-2 rounded-2xl font-medium transition",
    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent",
    fullWidth && "w-full",
    {
      primary:
        "bg-midnight text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed",
      secondary:
        "bg-surface text-midnight border border-surface hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed",
      ghost:
        "bg-transparent text-midnight hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed",
      outline:
        "bg-transparent text-midnight border border-midnight/20 hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed",
    }[variant],
    { sm: "px-3 py-1.5 text-sm", md: "px-4 py-2 text-base", lg: "px-5 py-3 text-lg" }[size],
    className
  );

  const handleClick = (e: MouseEvent) => {
    if (disabled) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    try {
      // @ts-ignore project-brede analytics helper
      if (dataTrack) track?.(dataTrack);
    } catch {}
    onClick?.(e);
  };

  const Component = (as || "button") as ElementType;

  const commonProps = {
    className: classes,
    "data-variant": variant,
    "data-size": size,
    onClick: handleClick,
    disabled: (Component === "button" ? disabled : undefined) as boolean | undefined,
  };

  if (Component === "a" && disabled) {
    (rest as any).href = undefined;
    (rest as any).tabIndex = -1;
    (rest as any)["aria-disabled"] = true;
  }

  return (
    <Component {...(rest as object)} {...commonProps}>
      {children}
    </Component>
  );
}

export default Button;