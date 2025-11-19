import React from "react";
import { Sparkles } from "lucide-react";

interface NovaMatchBadgeProps {
  score: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const NovaMatchBadge: React.FC<NovaMatchBadgeProps> = ({
  score,
  size = 'md',
  showIcon = true
}) => {
  const clampedScore = Math.max(0, Math.min(100, score));

  const getScoreColor = (s: number) => {
    if (s >= 90) return 'from-green-500 to-emerald-500';
    if (s >= 80) return 'from-blue-500 to-cyan-500';
    if (s >= 70) return 'from-amber-500 to-yellow-500';
    return 'from-red-500 to-orange-500';
  };

  const getTextColor = (s: number) => {
    if (s >= 90) return 'text-green-700 dark:text-green-400';
    if (s >= 80) return 'text-blue-700 dark:text-blue-400';
    if (s >= 70) return 'text-amber-700 dark:text-amber-400';
    return 'text-red-700 dark:text-red-400';
  };

  const getBgColor = (s: number) => {
    if (s >= 90) return 'bg-green-100 dark:bg-green-900/30';
    if (s >= 80) return 'bg-blue-100 dark:bg-blue-900/30';
    if (s >= 70) return 'bg-amber-100 dark:bg-amber-900/30';
    return 'bg-red-100 dark:bg-red-900/30';
  };

  const sizeClasses = {
    xs: 'text-xs px-2 py-0.5 gap-1',
    sm: 'text-xs px-2.5 py-1 gap-1',
    md: 'text-sm px-3 py-1.5 gap-1.5',
    lg: 'text-base px-4 py-2 gap-2'
  };

  const iconSizes = {
    xs: 'w-2.5 h-2.5',
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4'
  };

  const gradient = getScoreColor(clampedScore);
  const textColor = getTextColor(clampedScore);
  const bgColor = getBgColor(clampedScore);

  return (
    <div
      className={`inline-flex items-center ${sizeClasses[size]} ${bgColor} rounded-full font-bold ${textColor} shadow-sm`}
      title={`Nova AI Match: ${clampedScore}% - Deze outfit past perfect bij jouw stijl`}
    >
      {showIcon && <Sparkles className={iconSizes[size]} />}
      <span>{clampedScore}%</span>
    </div>
  );
};
