import React from "react";

interface PremiumButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit" | "reset";
}

export default function PremiumButton({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  onClick,
  className = "",
  type = "button"
}: PremiumButtonProps) {
  const baseClasses = "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variantClasses = {
    primary: "ff-cta",
    ghost: "ff-ghost",
    danger: "bg-[var(--ff-color-danger-500)] hover:bg-[var(--ff-color-danger-600)] text-white border border-[var(--ff-color-danger-500)] rounded-xl"
  };
  
  // WCAG AAA: minimum 44px touch targets
  const sizeClasses = {
    sm: "px-4 py-2.5 min-h-[44px] text-sm",
    md: "px-5 py-3 min-h-[48px] text-base",
    lg: "px-6 py-4 min-h-[56px] text-lg"
  };
  
  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}