import React from "react";

interface PremiumChipProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "accent";
  size?: "sm" | "md";
  className?: string;
}

export default function PremiumChip({ 
  children, 
  variant = "default", 
  size = "md",
  className = "" 
}: PremiumChipProps) {
  const baseClasses = "ff-chip inline-flex items-center gap-1 font-medium";
  
  const variantClasses = {
    default: "bg-white/6 border-white/12 text-[#E6E9F2]",
    success: "bg-[#22C55E]/10 border-[#22C55E]/20 text-[#22C55E]",
    warning: "bg-[#F59E0B]/10 border-[#F59E0B]/20 text-[#F59E0B]",
    danger: "bg-[#F43F5E]/10 border-[#F43F5E]/20 text-[#F43F5E]",
    accent: "bg-[#67E8F9]/10 border-[#67E8F9]/20 text-[#67E8F9]"
  };
  
  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm"
  };
  
  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}>
      {children}
    </span>
  );
}