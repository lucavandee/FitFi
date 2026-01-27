/**
 * ResultsSkeleton Component
 *
 * Stable layout skeleton loader for results page
 * Prevents CLS (Cumulative Layout Shift) during loading
 *
 * Goal: CLS ≤ 0.1 (Web Vitals threshold)
 */

import React from "react";
import { motion } from "framer-motion";

const Block: React.FC<{ className?: string }> = ({ className = "" }) =>
  <div aria-hidden className={`animate-pulse rounded-[var(--radius-lg)] bg-[color-mix(in_oklab,_var(--color-surface)_60%,_var(--color-border))] ${className}`} />;

interface ResultsSkeletonProps {
  /** Number of outfit cards to show */
  outfitCount?: number;
}

export function ResultsSkeleton({ outfitCount = 6 }: ResultsSkeletonProps) {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Hero Skeleton - Matches actual hero dimensions */}
      <div className="ff-container py-12 sm:py-16 md:py-20">
        <div className="text-center mb-12">
          {/* Badge */}
          <div className="inline-flex items-center justify-center mb-6">
            <Block className="h-8 w-32" />
          </div>

          {/* Title - Two lines */}
          <div className="space-y-4 mb-6">
            <Block className="h-12 sm:h-16 md:h-20 max-w-2xl mx-auto" />
            <Block className="h-12 sm:h-16 md:h-20 max-w-xl mx-auto" />
          </div>

          {/* Description */}
          <div className="space-y-3 mb-8 max-w-3xl mx-auto">
            <Block className="h-6" />
            <Block className="h-6 max-w-md mx-auto" />
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center mb-12">
            <Block className="h-14 w-full sm:w-48" />
            <Block className="h-14 w-full sm:w-48" />
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-4 sm:gap-6 max-w-2xl mx-auto">
            {[1, 2, 3].map((i) => (
              <div key={i} className="text-center">
                <Block className="h-10 sm:h-12 w-20 mx-auto mb-2" />
                <Block className="h-4 w-16 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Profile Section */}
      <div className="bg-[var(--color-surface)] border-y border-[var(--color-border)] py-12 sm:py-16">
        <div className="ff-container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto">
            {/* Archetype */}
            <div className="space-y-6">
              <Block className="h-8 w-48 mb-6" />
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Block className="h-5 w-32" />
                      <Block className="h-5 w-12" />
                    </div>
                    <Block className="h-3" />
                  </div>
                ))}
              </div>
            </div>

            {/* Color Palette */}
            <div className="space-y-6">
              <Block className="h-8 w-48 mb-6" />
              <div className="grid grid-cols-5 gap-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Block key={i} className="aspect-square" />
                ))}
              </div>
              <div className="space-y-3 mt-6">
                <Block className="h-5" />
                <Block className="h-5 max-w-xs" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Outfit Grid */}
      <div className="ff-container py-12 sm:py-16">
        <div className="mb-8">
          <Block className="h-10 w-64 mb-6" />
          <div className="flex items-center justify-between mb-6">
            <Block className="h-12 w-48" />
            <Block className="h-12 w-32" />
          </div>
        </div>

        {/* Fixed dimensions prevent CLS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {Array.from({ length: outfitCount }).map((_, i) => (
            <OutfitCardSkeleton key={i} delay={i * 0.05} />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * OutfitCardSkeleton - Matches actual OutfitCard dimensions
 */
function OutfitCardSkeleton({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay }}
      className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-sm"
    >
      {/* Image - 4:5 aspect ratio */}
      <Block className="aspect-[4/5]" />

      {/* Content */}
      <div className="p-4 space-y-3">
        <Block className="h-6" />
        <div className="space-y-2">
          <Block className="h-4" />
          <Block className="h-4 max-w-3/4" />
        </div>
        <div className="flex items-center gap-2 pt-2">
          <Block className="h-10 flex-1" />
          <Block className="h-10 w-10" />
        </div>
      </div>
    </motion.div>
  );
}

export default ResultsSkeleton;