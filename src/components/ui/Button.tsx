import { MouseEvent, ReactNode } from "react";
import clsx from "clsx";

type Variant = "primary" | "secondary" | "ghost";
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

type AsButton = BaseProps & {
  as?: "button";
  type?: "button" | "submit" | "reset";
};

type AsAnchor = BaseProps & {
  as: "a";
  href: string;
  target?: "_self" | "_blank" | "_parent" | "_top";
  rel?: string;
};

type Props = AsButton | AsAnchor;

function Button(props: Props) {
  const {
    children,
    className,
    variant = "primary",
    size = "md",
    fullWidth,
    disabled,
    onClick,
    "data-track": dataTrack,
  } = props;

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
    }[variant],
    {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-base",
      lg: "px-5 py-3 text-lg",
    }[size],
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

  const commonProps = {
    className: classes,
    "data-variant": variant,
    "data-size": size,
    onClick: handleClick,
  };

  if (props.as === "a") {
    const { href, target, rel } = props as AsAnchor;
    
    const anchorProps = disabled 
      ? { ...commonProps, tabIndex: -1, "aria-disabled": true }
      : { ...commonProps, href, target, rel };

    return <a {...anchorProps}>{children}</a>;
  }

  const { type = "button" } = props as AsButton;

  return (
    <button 
      type={type} 
      className={classes} 
      disabled={disabled} 
      onClick={handleClick}
      data-variant={variant}
      data-size={size}
    >
      {children}
    </button>
  );
}

export default Button;