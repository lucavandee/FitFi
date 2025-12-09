import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { ARCHETYPES, type ArchetypeKey } from "@/config/archetypes";

interface ArchetypeScore {
  archetype: ArchetypeKey;
  percentage: number;
}

interface ArchetypeBreakdownProps {
  archetypeScores: ArchetypeScore[];
  className?: string;
}

/**
 * Archetype Breakdown Component
 * Shows top 3 style archetypes with visual percentages and descriptions
 */
export function ArchetypeBreakdown({ archetypeScores, className = "" }: ArchetypeBreakdownProps) {
  const top3 = archetypeScores
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 3);

  if (top3.length === 0) {
    return null;
  }

  return (
    <div className={`bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6 sm:p-8 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--ff-color-primary-100)] to-[var(--ff-color-accent-100)] flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-[var(--ff-color-primary-700)]" />
        </div>
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-[var(--color-text)]">
            Jouw stijl DNA
          </h3>
          <p className="text-sm text-[var(--color-text-muted)]">
            Top 3 stijlarchetypes die jou definiëren
          </p>
        </div>
      </div>

      {/* Archetype Cards */}
      <div className="space-y-4">
        {top3.map((item, index) => {
          const archetype = ARCHETYPES[item.archetype];
          const isPrimary = index === 0;

          return (
            <motion.div
              key={item.archetype}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`
                relative overflow-hidden rounded-xl border-2 p-4 sm:p-5 transition-all
                ${isPrimary
                  ? "border-[var(--ff-color-primary-400)] bg-gradient-to-br from-[var(--ff-color-primary-50)] to-[var(--ff-color-accent-50)]"
                  : "border-[var(--color-border)] bg-[var(--color-bg)]"
                }
              `}
            >
              {/* Ranking Badge */}
              <div className="absolute top-3 right-3">
                <span
                  className={`
                    inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold
                    ${isPrimary
                      ? "bg-[var(--ff-color-primary-600)] text-white"
                      : "bg-[var(--color-border)] text-[var(--color-text-muted)]"
                    }
                  `}
                >
                  #{index + 1}
                </span>
              </div>

              {/* Content */}
              <div className="pr-12">
                {/* Label + Percentage */}
                <div className="flex items-baseline gap-3 mb-2">
                  <h4 className={`text-lg sm:text-xl font-bold ${isPrimary ? "text-[var(--ff-color-primary-800)]" : "text-[var(--color-text)]"}`}>
                    {archetype.label}
                  </h4>
                  <span className={`text-2xl sm:text-3xl font-black ${isPrimary ? "text-[var(--ff-color-primary-700)]" : "text-[var(--color-text-muted)]"}`}>
                    {Math.round(item.percentage)}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="relative h-3 bg-white/50 dark:bg-gray-800/50 rounded-full overflow-hidden mb-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percentage}%` }}
                    transition={{ delay: index * 0.1 + 0.2, duration: 0.8, ease: "easeOut" }}
                    className={`
                      absolute inset-y-0 left-0 rounded-full
                      ${isPrimary
                        ? "bg-gradient-to-r from-[var(--ff-color-primary-500)] to-[var(--ff-color-primary-600)]"
                        : "bg-gradient-to-r from-[var(--ff-color-primary-300)] to-[var(--ff-color-primary-400)]"
                      }
                    `}
                  />
                </div>

                {/* Description */}
                <p className="text-sm text-[var(--color-text-muted)] mb-2">
                  {archetype.vibe.slice(0, 3).map((v, i) => (
                    <span key={i}>
                      {i > 0 && " · "}
                      <span className="capitalize">{v}</span>
                    </span>
                  ))}
                </p>

                {/* Staples (only for primary) */}
                {isPrimary && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {archetype.staples.slice(0, 3).map((staple, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-white/80 dark:bg-gray-800/80 border border-[var(--ff-color-primary-300)] text-[var(--ff-color-primary-700)] text-xs font-semibold rounded-full"
                      >
                        {staple}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer Explanation */}
      <div className="mt-6 p-4 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)]">
        <p className="text-xs sm:text-sm text-[var(--color-text-muted)] leading-relaxed">
          <strong className="text-[var(--color-text)]">Wat betekent dit?</strong>{" "}
          Jouw stijl is een unieke mix van deze archetypes. De AI gebruikt deze percentages om outfits te matchen die perfect bij je passen.
        </p>
      </div>
    </div>
  );
}
