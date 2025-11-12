import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface StyleDNAMatchBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

export function StyleDNAMatchBadge({
  score,
  size = "md",
  showIcon = true
}: StyleDNAMatchBadgeProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return {
      bg: "bg-gradient-to-r from-green-500 to-emerald-500",
      text: "text-white",
      ring: "ring-green-400/50",
      label: "Perfect Match"
    };
    if (score >= 80) return {
      bg: "bg-gradient-to-r from-[var(--ff-color-primary-500)] to-[var(--ff-color-accent-500)]",
      text: "text-white",
      ring: "ring-[var(--ff-color-primary-400)]/50",
      label: "Great Match"
    };
    if (score >= 70) return {
      bg: "bg-gradient-to-r from-blue-500 to-cyan-500",
      text: "text-white",
      ring: "ring-blue-400/50",
      label: "Good Match"
    };
    return {
      bg: "bg-gradient-to-r from-gray-500 to-gray-600",
      text: "text-white",
      ring: "ring-gray-400/50",
      label: "Match"
    };
  };

  const sizeClasses = {
    sm: "px-2 py-1 text-xs gap-1",
    md: "px-3 py-1.5 text-sm gap-1.5",
    lg: "px-4 py-2 text-base gap-2"
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5"
  };

  const { bg, text, ring, label } = getScoreColor(score);

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 25,
        delay: 0.2
      }}
      whileHover={{ scale: 1.05 }}
      className={`
        inline-flex items-center ${sizeClasses[size]}
        ${bg} ${text}
        rounded-full font-bold
        shadow-lg ring-2 ${ring}
        backdrop-blur-sm
      `}
      title={label}
    >
      {showIcon && (
        <Sparkles className={iconSizes[size]} />
      )}
      <span>{score}%</span>
    </motion.div>
  );
}
