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
  const base = "inline-flex items-center justify-center gap-2 font-medium transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C2654A]";
  const v =
    variant === "primary"
      ? "bg-[#C2654A] hover:bg-[#A8513A] text-white font-semibold rounded-xl"
      : variant === "secondary"
      ? "bg-white border border-[#E5E5E5] hover:border-[#C2654A] text-[#1A1A1A] rounded-xl"
      : variant === "ghost"
      ? "bg-transparent border border-[#E5E5E5] hover:border-[#C2654A] text-[#1A1A1A] rounded-xl"
      : "text-[#4A4A4A] hover:text-[#1A1A1A]";
  // WCAG AAA: minimum 44px touch targets (h-11 = 44px)
  const s = size === "sm" ? "h-11 px-4 text-sm" : size === "lg" ? "h-14 px-6 text-base" : "h-12 px-5 text-base";
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
        className={cls}
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
        className={`${cls} ${loading ? 'pointer-events-none' : ''}`}
        {...linkProps}
      >
        {content}
      </a>
    );
  }

  const Component = as;
  return (
    <Component
      className={cls}
      {...rest}
    >
      {content}
    </Component>
  );
}

export default Button;
export { Button };