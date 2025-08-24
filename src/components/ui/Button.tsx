import React from "react";
import { Link } from "react-router-dom";

export interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  as?: "button" | "a" | typeof Link;
  to?: string;
  href?: string;
  target?: string;
  rel?: string;
  "aria-label"?: string;
  "aria-busy"?: boolean;
  "data-ab-variant"?: string;
  title?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  disabled = false,
  loading = false,
  icon,
  iconPosition = "left",
  className = "",
  onClick,
  type = "button",
  as = "button",
  to,
  href,
  target,
  rel,
  "aria-label": ariaLabel,
  "aria-busy": ariaBusy,
  "data-ab-variant": abVariant,
  title,
  ...rest
}) => {
  const baseClasses = [
    "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--ff-ring)] focus-visible:ring-offset-white",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    fullWidth ? "w-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const variantClasses = {
    primary:
      "bg-[#89CFF0] text-white hover:bg-[#5FB7E6] shadow-[0_10px_30px_rgba(137,207,240,0.35)] btn-animate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--ff-ring)] focus-visible:ring-offset-white",
    secondary:
      "bg-[#0D1B2A] hover:bg-[#14243A] text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--ff-ring)] focus-visible:ring-offset-white btn-animate",
    outline:
      "border border-[#89CFF0] bg-white hover:bg-[#89CFF0]/10 text-[#0D1B2A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--ff-ring)] focus-visible:ring-offset-white btn-animate",
    ghost:
      "bg-transparent hover:bg-[#89CFF0]/10 text-[#0D1B2A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--ff-ring)] focus-visible:ring-offset-white btn-animate",
    danger:
      "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 focus-visible:ring-red-500",
  };

  const sizeClasses = {
    sm: "px-3 py-2 text-sm rounded-xl",
    md: "px-4 py-2 text-base rounded-2xl",
    lg: "px-6 py-3 text-lg rounded-2xl",
  };

  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
  ].join(" ");

  const content = (
    <>
      {icon && iconPosition === "left" && <span className="mr-2">{icon}</span>}
      {children}
      {icon && iconPosition === "right" && <span className="ml-2">{icon}</span>}
    </>
  );

  const commonProps = {
    className: classes,
    disabled: disabled || loading,
    "aria-label": ariaLabel,
    "aria-busy": ariaBusy || loading,
    "data-ab-variant": abVariant,
    title,
    ...rest,
  };

  if (as === "a") {
    return (
      <a href={href} target={target} rel={rel} {...commonProps}>
        {content}
      </a>
    );
  }

  if (as === Link) {
    return (
      <Link to={to || "/"} {...commonProps}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} {...commonProps}>
      {content}
    </button>
  );
};

export default Button;
