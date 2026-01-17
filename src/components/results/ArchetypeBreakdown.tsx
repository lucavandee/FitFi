import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Layers, TrendingUp } from "lucide-react";
import { ARCHETYPES, type ArchetypeKey } from "@/config/archetypes";

interface ArchetypeScore {
  archetype: ArchetypeKey;
  percentage: number;
}

interface ArchetypeBreakdownProps {
  archetypeScores: ArchetypeScore[];
  confidence?: number; // 0-1 scale
  className?: string;
}

/**
 * Archetype Breakdown Component
 * Shows top 3 style archetypes with visual percentages and descriptions
 * Now with hybrid style detection and adaptive messaging
 */
export function ArchetypeBreakdown({ archetypeScores, confidence = 0.7, className = "" }: ArchetypeBreakdownProps) {
  const top3 = archetypeScores
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 3);

  if (top3.length === 0) {
    return null;
  }

  // Determine if this is a hybrid/mixed style profile
  const isHybrid = confidence < 0.7 || (top3.length >= 2 && top3[1].percentage > 25);
  const primary = top3[0];
  const secondary = top3.length >= 2 ? top3[1] : null;

  // Generate hybrid description
  const getHybridDescription = () => {
    if (!isHybrid || !secondary) return null;

    const primaryName = ARCHETYPES[primary.archetype].label;
    const secondaryName = ARCHETYPES[secondary.archetype].label;

    return `Je combineert ${primaryName.toLowerCase()} (${Math.round(primary.percentage)}%) met ${secondaryName.toLowerCase()} (${Math.round(secondary.percentage)}%) elementen`;
  };

  // Adaptive messaging based on confidence
  const getConfidenceMessage = () => {
    if (confidence >= 0.85) {
      return "Je hebt een zeer duidelijke en consistente stijlvoorkeur";
    } else if (confidence >= 0.7) {
      return "Je stijlvoorkeuren zijn helder en goed gedefinieerd";
    } else if (confidence >= 0.5) {
      return "Je stijl is veelzijdig en combineert meerdere elementen";
    } else {
      return "Je hebt een eclectische stijl die meerdere archetypen mengt";
    }
  };

  return (
    <div className={`bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6 sm:p-8 ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--ff-color-primary-100)] to-[var(--ff-color-accent-100)] flex items-center justify-center">
            {isHybrid ? (
              <Layers className="w-6 h-6 text-[var(--ff-color-primary-700)]" />
            ) : (
              <Sparkles className="w-6 h-6 text-[var(--ff-color-primary-700)]" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-xl sm:text-2xl font-bold text-[var(--color-text)]">
              Jouw stijl DNA
            </h3>
            <p className="text-sm text-[var(--color-text-muted)]">
              {getConfidenceMessage()}
            </p>
          </div>
        </div>

        {/* Hybrid Style Indicator */}
        {isHybrid && secondary && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-gradient-to-r from-[var(--ff-color-primary-50)] to-[var(--ff-color-accent-50)] rounded-xl border border-[var(--ff-color-primary-200)]"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-[var(--ff-color-primary-700)]" />
              </div>
              <div>
                <p className="font-semibold text-[var(--color-text)] mb-1">
                  Hybride Stijl Gedetecteerd
                </p>
                <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                  {getHybridDescription()}
                </p>
              </div>
            </div>
          </motion.div>
        )}
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
