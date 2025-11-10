import React from 'react';

/**
 * Premium loading skeletons for dashboard components
 * Provides perceived performance during data fetching
 */

const shimmerBase = "relative overflow-hidden bg-gray-200 dark:bg-gray-800 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent";

export function GamificationWidgetSkeleton() {
  return (
    <div className="space-y-6">
      {/* Main XP Card Skeleton */}
      <div className="bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-3xl p-8 shadow-xl border-2 border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl ${shimmerBase}`} />
            <div className="space-y-2">
              <div className={`w-32 h-6 rounded-lg ${shimmerBase}`} />
              <div className={`w-24 h-4 rounded-lg ${shimmerBase}`} />
            </div>
          </div>
          <div className={`w-24 h-10 rounded-full ${shimmerBase}`} />
        </div>

        {/* Progress bar skeleton */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <div className={`w-32 h-4 rounded ${shimmerBase}`} />
            <div className={`w-16 h-4 rounded ${shimmerBase}`} />
          </div>
          <div className={`w-full h-4 rounded-full ${shimmerBase}`} />
        </div>

        {/* Stats grid skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-3">
              <div className={`w-8 h-8 rounded-lg ${shimmerBase} mb-2`} />
              <div className={`w-12 h-6 rounded ${shimmerBase} mb-1`} />
              <div className={`w-16 h-3 rounded ${shimmerBase}`} />
            </div>
          ))}
        </div>

        {/* Button skeleton */}
        <div className={`w-full h-12 rounded-xl ${shimmerBase}`} />
      </div>

      {/* Achievements skeleton */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-xl border-2 border-gray-200 dark:border-gray-700">
        <div className={`w-48 h-6 rounded mb-4 ${shimmerBase}`} />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl">
              <div className={`w-14 h-14 rounded-xl ${shimmerBase}`} />
              <div className="flex-1 space-y-2">
                <div className={`w-32 h-4 rounded ${shimmerBase}`} />
                <div className={`w-24 h-3 rounded ${shimmerBase}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function OutfitCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden">
      {/* Image skeleton */}
      <div className={`w-full aspect-[3/4] ${shimmerBase}`} />

      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        <div className={`w-3/4 h-5 rounded ${shimmerBase}`} />
        <div className={`w-1/2 h-4 rounded ${shimmerBase}`} />

        {/* Tags skeleton */}
        <div className="flex gap-2">
          <div className={`w-16 h-6 rounded-full ${shimmerBase}`} />
          <div className={`w-16 h-6 rounded-full ${shimmerBase}`} />
        </div>

        {/* Button skeleton */}
        <div className={`w-full h-10 rounded-xl ${shimmerBase}`} />
      </div>
    </div>
  );
}

export function RefineStyleSkeleton() {
  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-3xl p-6 shadow-xl border-2 border-purple-200 dark:border-purple-800">
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-2">
          <div className={`w-48 h-6 rounded ${shimmerBase}`} />
          <div className={`w-64 h-4 rounded ${shimmerBase}`} />
        </div>
      </div>

      {/* Cards skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="aspect-[3/4] rounded-xl overflow-hidden">
            <div className={`w-full h-full ${shimmerBase}`} />
          </div>
        ))}
      </div>

      <div className={`w-full h-12 rounded-xl mt-6 ${shimmerBase}`} />
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl ${shimmerBase}`} />
        <div className={`w-16 h-8 rounded ${shimmerBase}`} />
      </div>
      <div className={`w-32 h-5 rounded mb-1 ${shimmerBase}`} />
      <div className={`w-24 h-4 rounded ${shimmerBase}`} />
    </div>
  );
}

export function ProfileHeaderSkeleton() {
  return (
    <div className="flex items-center gap-4 p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-lg">
      <div className={`w-20 h-20 rounded-full ${shimmerBase}`} />
      <div className="flex-1 space-y-3">
        <div className={`w-48 h-6 rounded ${shimmerBase}`} />
        <div className={`w-32 h-4 rounded ${shimmerBase}`} />
        <div className="flex gap-2">
          <div className={`w-20 h-6 rounded-full ${shimmerBase}`} />
          <div className={`w-20 h-6 rounded-full ${shimmerBase}`} />
        </div>
      </div>
    </div>
  );
}

export function SavedOutfitsGallerySkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <OutfitCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Page-level skeletons
export function DashboardPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero skeleton */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 py-12">
        <div className="ff-container">
          <div className={`w-64 h-10 rounded mb-4 ${shimmerBase}`} />
          <div className={`w-96 h-6 rounded ${shimmerBase}`} />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="ff-container py-12">
        <div className="space-y-12">
          {/* Stats grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>

          {/* Main widgets */}
          <RefineStyleSkeleton />
          <GamificationWidgetSkeleton />

          {/* Outfits gallery */}
          <SavedOutfitsGallerySkeleton />
        </div>
      </div>
    </div>
  );
}
