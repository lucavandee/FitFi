import React from "react";

type Variant = "primary" | "secondary" | "quiet";
type Size = "sm" | "md" | "lg";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  as?: "button" | "a";
  href?: string;
};

function classes(variant: Variant, size: Size, extra?: string) {
  const base = "ff-btn";
  const v =
    variant === "primary"
      ? "ff-btn-primary"
      : variant === "secondary"
      ? "ff-btn-secondary"
      : "ff-btn-quiet";
  const s = size === "sm" ? "h-9 px-3" : size === "lg" ? "h-12 px-6" : "h-10 px-5";
  return [base, v, s, extra].filter(Boolean).join(" ");
}

export default function Button({
  variant = "secondary",
  size = "md",
  as = "button",
  href,
  className,
  children,
  ...rest
}: Props) {
  const cls = classes(variant, size, className);
  if (as === "a") return <a href={href} className={cls} {...(rest as any)}>{children}</a>;
  return <button type="button" className={cls} {...rest}>{children}</button>;
}