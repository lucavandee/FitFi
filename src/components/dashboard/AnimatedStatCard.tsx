import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

interface AnimatedStatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
  gradient: string;
  delay?: number;
}

export function AnimatedStatCard({
  icon,
  label,
  value,
  suffix = "",
  trend,
  gradient,
  delay = 0,
}: AnimatedStatCardProps) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(count, value, {
      duration: 1.5,
      delay,
      ease: "easeOut",
      onUpdate: (latest) => setDisplayValue(Math.round(latest)),
    });

    return controls.stop;
  }, [count, value, delay]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02, y: -4 }}
      className="group relative bg-[var(--color-surface)] rounded-2xl p-6 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-md)] transition-all border-2 border-[var(--color-border)] hover:border-[var(--ff-color-primary-300)] overflow-hidden"
    >
      {/* Gradient background on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--ff-color-primary-50)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative">
        {/* Icon & Value Row */}
        <div className="flex items-start justify-between mb-4">
          <div
            className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}
          >
            <div className="text-white">{icon}</div>
          </div>

          <div className="text-right">
            <div className="text-3xl font-bold text-[var(--color-text)] tabular-nums">
              {displayValue.toLocaleString()}
              {suffix && (
                <span className="text-xl text-[var(--color-text-muted)] ml-1">
                  {suffix}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Label */}
        <h3 className="text-sm font-semibold text-[var(--color-text)] mb-2">
          {label}
        </h3>

        {/* Trend Indicator */}
        {trend && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: delay + 0.3 }}
            className="flex items-center gap-2"
          >
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                trend.isPositive
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
              }`}
            >
              {trend.isPositive ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {Math.abs(trend.value)}%
            </div>
            <span className="text-xs text-[var(--color-text-muted)]">
              {trend.label}
            </span>
          </motion.div>
        )}

        {/* Progress bar (optional) */}
        <div className="mt-3 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className={`h-full bg-gradient-to-r ${gradient} rounded-full`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((value / 100) * 100, 100)}%` }}
            transition={{ duration: 1, delay: delay + 0.2, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Hover glow effect */}
      <div className="absolute -inset-px bg-gradient-to-r from-[var(--ff-color-primary-500)] to-[var(--ff-color-accent-500)] rounded-2xl opacity-0 group-hover:opacity-20 blur transition-opacity" />
    </motion.div>
  );
}
