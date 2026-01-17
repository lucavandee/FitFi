import React from "react";
import { motion } from "framer-motion";
import { ARCHETYPES, type ArchetypeKey } from "@/config/archetypes";

interface StyleMixItem {
  archetype: ArchetypeKey;
  percentage: number;
}

interface StyleDNAMixIndicatorProps {
  mixItems: StyleMixItem[];
  confidence: number;
  className?: string;
}

/**
 * Visual breakdown of style DNA mix
 * Shows pie chart and percentage breakdown of archetype composition
 */
export function StyleDNAMixIndicator({
  mixItems,
  confidence,
  className = ""
}: StyleDNAMixIndicatorProps) {
  const sortedMix = mixItems
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 4); // Top 4 max

  // Calculate cumulative percentages for pie chart
  let cumulativePercentage = 0;

  return (
    <div className={`bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6 sm:p-8 ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl sm:text-2xl font-bold text-[var(--color-text)] mb-2">
          Stijl DNA Samenstelling
        </h3>
        <p className="text-sm text-[var(--color-text-muted)]">
          Jouw stijl bestaat uit {sortedMix.length} {sortedMix.length === 1 ? 'archetype' : 'archetypen'}
        </p>
      </div>

      {/* Visual Bar Chart */}
      <div className="mb-8">
        {/* Combined Bar */}
        <div className="h-16 rounded-xl overflow-hidden bg-gray-100 flex mb-4">
          {sortedMix.map((item, index) => {
            const archetype = ARCHETYPES[item.archetype];
            const colors = [
              'bg-gradient-to-r from-[var(--ff-color-primary-500)] to-[var(--ff-color-primary-600)]',
              'bg-gradient-to-r from-[var(--ff-color-accent-500)] to-[var(--ff-color-accent-600)]',
              'bg-gradient-to-r from-purple-500 to-pink-500',
              'bg-gradient-to-r from-blue-500 to-indigo-500',
            ];

            return (
              <motion.div
                key={item.archetype}
                initial={{ width: 0 }}
                animate={{ width: `${item.percentage}%` }}
                transition={{ delay: index * 0.1, duration: 0.8, ease: "easeOut" }}
                className={`${colors[index % colors.length]} flex items-center justify-center relative group`}
                title={`${archetype.label}: ${Math.round(item.percentage)}%`}
              >
                {item.percentage > 10 && (
                  <span className="text-white font-bold text-sm">
                    {Math.round(item.percentage)}%
                  </span>
                )}
                {/* Tooltip on hover */}
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  <div className="bg-gray-900 text-white px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap shadow-lg">
                    {archetype.label}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-3">
          {sortedMix.map((item, index) => {
            const archetype = ARCHETYPES[item.archetype];
            const colorClasses = [
              'bg-[var(--ff-color-primary-500)]',
              'bg-[var(--ff-color-accent-500)]',
              'bg-purple-500',
              'bg-blue-500',
            ];

            return (
              <motion.div
                key={item.archetype}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.5 }}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className={`w-4 h-4 rounded-full ${colorClasses[index % colorClasses.length]} flex-shrink-0`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--color-text)] truncate">
                    {archetype.label}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {Math.round(item.percentage)}%
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Confidence Badge */}
      <div className="p-4 bg-gradient-to-r from-[var(--ff-color-primary-50)] to-[var(--ff-color-accent-50)] rounded-xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[var(--color-text)] mb-1">
              Profiel Betrouwbaarheid
            </p>
            <p className="text-xs text-[var(--color-text-muted)]">
              {confidence >= 0.85 && "Zeer hoog — consistente voorkeuren"}
              {confidence >= 0.7 && confidence < 0.85 && "Hoog — duidelijke voorkeuren"}
              {confidence >= 0.5 && confidence < 0.7 && "Gemiddeld — veelzijdige stijl"}
              {confidence < 0.5 && "Veelzijdig — eclectische mix"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-white border-4 border-[var(--ff-color-primary-600)] flex items-center justify-center">
              <span className="text-lg font-bold text-[var(--ff-color-primary-700)]">
                {Math.round(confidence * 100)}
              </span>
            </div>
            <span className="text-xs text-[var(--color-text-muted)] font-medium">%</span>
          </div>
        </div>
      </div>

      {/* Explanation */}
      <div className="mt-4 p-3 bg-white rounded-lg border border-[var(--color-border)]">
        <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
          <strong className="text-[var(--color-text)]">Wat betekent dit?</strong>{" "}
          De AI gebruikt deze mix om outfits te selecteren die meerdere aspecten van je stijl reflecteren.
          Een hogere betrouwbaarheid betekent dat je consistente voorkeuren hebt, een lagere score wijst op een veelzijdige, eclectische stijl.
        </p>
      </div>
    </div>
  );
}
