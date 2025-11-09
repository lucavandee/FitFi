import React from "react";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "secondary" | "quiet" | "ghost";
type Size = "sm" | "md" | "lg";

type BaseProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children?: React.ReactNode;
  loading?: boolean;
  loadingText?: string;
};

type ButtonAsButton = BaseProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> & {
    as?: "button";
  };

type ButtonAsLink = BaseProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseProps> & {
    as: "a";
    href: string;
  };

type ButtonAsComponent = BaseProps & {
  as: React.ElementType;
  to?: string;
  [key: string]: any;
};

type Props = ButtonAsButton | ButtonAsLink | ButtonAsComponent;

function classes(variant: Variant, size: Size, extra?: string) {
  const base = "ff-btn";
  const v =
    variant === "primary"
      ? "ff-btn-primary"
      : variant === "secondary"
      ? "ff-btn-secondary"
      : variant === "ghost"
      ? "ff-btn-ghost"
      : "ff-btn-quiet";
  const s = size === "sm" ? "h-9 px-3" : size === "lg" ? "h-12 px-6" : "h-10 px-5";
  return [base, v, s, extra].filter(Boolean).join(" ");
}

function Button({
  variant = "secondary",
  size = "md",
  as,
  className,
  children,
  loading = false,
  loadingText,
  ...rest
}: Props) {
  const cls = classes(variant, size, className);
  const iconSize = size === "sm" ? "w-4 h-4" : size === "lg" ? "w-6 h-6" : "w-5 h-5";

  const content = (
    <>
      {loading && (
        <Loader2 className={`${iconSize} animate-spin`} />
      )}
      <span className={loading ? "opacity-0" : ""}>
        {loading && loadingText ? loadingText : children}
      </span>
    </>
  );

  if (!as || as === "button") {
    return (
      <button
        type="button"
        className={`${cls} relative inline-flex items-center justify-center gap-2`}
        disabled={loading || rest.disabled}
        {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {content}
      </button>
    );
  }

  if (as === "a") {
    const { href, ...linkProps } = rest as ButtonAsLink;
    return (
      <a
        href={href}
        className={`${cls} relative inline-flex items-center justify-center gap-2 ${loading ? 'pointer-events-none' : ''}`}
        {...linkProps}
      >
        {content}
      </a>
    );
  }

  const Component = as;
  return (
    <Component
      className={`${cls} relative inline-flex items-center justify-center gap-2`}
      {...rest}
    >
      {content}
    </Component>
  );
}

export default Button;
export { Button };