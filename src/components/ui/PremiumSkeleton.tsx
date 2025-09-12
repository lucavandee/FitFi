import React from "react";

interface PremiumSkeletonProps {
  className?: string;
  variant?: "text" | "card" | "avatar" | "button";
}

export default function PremiumSkeleton({ 
  className = "", 
  variant = "text" 
}: PremiumSkeletonProps) {
  const baseClasses = "animate-pulse bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%]";
  
  const variantClasses = {
    text: "h-4 rounded",
    card: "h-48 rounded-2xl",
    avatar: "w-12 h-12 rounded-full",
    button: "h-12 rounded-xl"
  };
  
  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={{
        animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite, shimmer 2s linear infinite"
      }}
    />
  );
}

// Add shimmer keyframes to global CSS
const shimmerStyles = `
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = shimmerStyles;
  document.head.appendChild(styleSheet);
}