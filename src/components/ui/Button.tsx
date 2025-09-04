import { ReactNode } from "react";
import { joinClasses } from '@/utils/cn';

type ButtonProps = {
  as?: "button" | "a";
  href?: string;
  target?: string;
  rel?: string;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
};

export default function Button({
  as = "button",
  href,
  target,
  rel,
  onClick,
  children,
  className,
  disabled,
}: ButtonProps) {
  const commonProps = {
    className:
      "inline-flex items-center justify-center px-4 py-2 rounded-2xl font-semibold bg-midnight text-white hover:bg-accent transition-colors disabled:opacity-50 " +
      (className || ""),
    onClick,
    "aria-disabled": disabled,
  };

  const content = children;

  if (as === "a") {
    return (
      <a href={href} target={target} rel={rel} {...commonProps}>
        {content}
      </a>
    );
  }

  return (
    <button type="button" disabled={disabled} {...commonProps}>
      {content}
    </button>
  );
}