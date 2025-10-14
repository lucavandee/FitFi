import React from "react";

interface PremiumCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
}

export default function PremiumCard({ 
  children, 
  className = "", 
  hover = false,
  glow = false 
}: PremiumCardProps) {
  const baseClasses = "ff-card p-6";
  const hoverClasses = hover ? "transition-all duration-300 hover:transform hover:scale-[1.02] hover:shadow-2xl" : "";
  const glowClasses = glow ? "ring-1 ring-[#67E8F9]/20 shadow-[0_0_30px_rgba(103,232,249,0.1)]" : "";
  
  return (
    <div className={`${baseClasses} ${hoverClasses} ${glowClasses} ${className}`}>
      {children}
    </div>
  );
}