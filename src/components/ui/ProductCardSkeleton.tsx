import React from 'react';

interface ProductCardSkeletonProps {
  count?: number;
  className?: string;
}

export function ProductCardSkeleton({ count = 1, className = '' }: ProductCardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`bg-white rounded-2xl shadow-sm overflow-hidden ${className}`}
          role="status"
          aria-label="Product laden..."
        >
          {/* Image Skeleton - Reserved Space */}
          <div className="aspect-[3/4] bg-gradient-to-br from-[var(--color-bg)] via-slate-100 to-[var(--color-bg)] animate-pulse" />

          {/* Content Skeleton */}
          <div className="p-4 space-y-3">
            {/* Title */}
            <div className="space-y-2">
              <div className="h-4 bg-gradient-to-r from-[var(--color-bg)] via-slate-100 to-[var(--color-bg)] rounded-md w-3/4 animate-pulse" />
              <div className="h-3 bg-gradient-to-r from-[var(--color-bg)] via-slate-100 to-[var(--color-bg)] rounded-md w-1/2 animate-pulse" />
            </div>

            {/* Price + Buttons */}
            <div className="flex items-center justify-between pt-2">
              <div className="h-6 bg-gradient-to-r from-[var(--color-bg)] via-slate-100 to-[var(--color-bg)] rounded-md w-16 animate-pulse" />
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-gradient-to-r from-[var(--color-bg)] via-slate-100 to-[var(--color-bg)] rounded-md animate-pulse" />
                <div className="h-8 w-20 bg-gradient-to-r from-[var(--color-bg)] via-slate-100 to-[var(--color-bg)] rounded-md animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

export default ProductCardSkeleton;
