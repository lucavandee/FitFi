import React from "react";
import { Calendar, Lightbulb, TrendingUp, Sparkles, Target, Clock, Heart, X } from "lucide-react";
import { Link } from "react-router-dom";

export type InsightType =
  | 'seasonal'
  | 'style-tip'
  | 'gap'
  | 'trending'
  | 'color-advice'
  | 'upcoming-event'
  | 'personal-goal';

interface NovaInsightCardProps {
  type: InsightType;
  insight: string;
  action?: string;
  actionLink?: string;
  confidence: number;
  priority: 'low' | 'medium' | 'high';
  onDismiss?: () => void;
}

const iconMap: Record<InsightType, React.ElementType> = {
  'seasonal': Calendar,
  'style-tip': Lightbulb,
  'gap': Target,
  'trending': TrendingUp,
  'color-advice': Sparkles,
  'upcoming-event': Clock,
  'personal-goal': Heart
};

const gradientMap: Record<InsightType, string> = {
  'seasonal': 'from-blue-500 to-cyan-500',
  'style-tip': 'from-amber-500 to-orange-500',
  'gap': 'from-purple-500 to-pink-500',
  'trending': 'from-green-500 to-emerald-500',
  'color-advice': 'from-violet-500 to-purple-500',
  'upcoming-event': 'from-rose-500 to-pink-500',
  'personal-goal': 'from-indigo-500 to-blue-500'
};

export const NovaInsightCard: React.FC<NovaInsightCardProps> = ({
  type,
  insight,
  action,
  actionLink,
  confidence,
  priority,
  onDismiss
}) => {
  const Icon = iconMap[type];
  const gradient = gradientMap[type];

  const priorityBadgeColor = {
    high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
  }[priority];

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-[#FFFFFF] border border-[#E5E5E5] shadow-sm hover:shadow-sm transition-all duration-300">
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient}`}></div>

      {onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-[#FAFAF8]/80 hover:bg-[#FAFAF8] text-[#8A8A8A] hover:text-[#1A1A1A] transition-colors opacity-0 group-hover:opacity-100 z-10"
          aria-label="Verberg dit inzicht"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg`}>
            <Icon className="w-5 h-5" />
          </div>

          <div className="flex gap-2">
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${priorityBadgeColor} uppercase tracking-wide`}>
              {priority}
            </span>
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-[#FAFAF8] text-[#8A8A8A]">
              {Math.round(confidence * 100)}%
            </span>
          </div>
        </div>

        <p className="text-[#1A1A1A] text-base font-medium leading-relaxed mb-4">
          {insight}
        </p>

        {action && actionLink && (
          <Link
            to={actionLink}
            className="inline-flex items-center gap-2 text-sm font-bold text-[#A8513A] hover:text-[#C2654A] transition-colors group-hover:gap-3 duration-300"
          >
            {action}
            <span aria-hidden="true">→</span>
          </Link>
        )}
      </div>
    </div>
  );
};
