import React from "react";

const OutfitSkeleton: React.FC = () => {
  return (
    <article className="outfit-card" aria-hidden="true">
      {/* Visual skeleton */}
      <div className="outfit-visual skeleton-shimmer">
        <div className="skeleton-rect h-full w-full" />
      </div>

      {/* Content skeleton */}
      <div className="outfit-content flow-sm">
        {/* Header */}
        <div className="flow-xs">
          <div className="skeleton-rect h-6 w-3/4" />
          <div className="cluster gap-1">
            <div className="skeleton-rect h-5 w-16" />
            <div className="skeleton-rect h-5 w-20" />
            <div className="skeleton-rect h-5 w-18" />
          </div>
        </div>

        {/* Explanation */}
        <div className="space-y-2">
          <div className="skeleton-rect h-4 w-full" />
          <div className="skeleton-rect h-4 w-5/6" />
        </div>

        {/* Items */}
        <div className="flow-xs">
          <div className="skeleton-rect h-4 w-16" />
          <div className="space-y-1">
            <div className="skeleton-rect h-3 w-24" />
            <div className="skeleton-rect h-3 w-28" />
            <div className="skeleton-rect h-3 w-20" />
            <div className="skeleton-rect h-3 w-26" />
          </div>
        </div>

        {/* CTA */}
        <div className="skeleton-rect h-9 w-32" />
      </div>
    </article>
  );
};

export default OutfitSkeleton;