import React from 'react';

export function SkeletonText({ className = '', lines = 1 }: { className?: string; lines?: number }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-4 skeleton ${i === lines - 1 ? 'w-4/5' : 'w-full'}`}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white rounded-2xl border-2 border-[var(--color-border)] p-6 ${className}`}>
      <div className="skeleton h-48 mb-4 rounded-xl" />
      <div className="skeleton h-6 w-3/4 mb-2" />
      <div className="skeleton h-4 w-full mb-2" />
      <div className="skeleton h-4 w-5/6" />
    </div>
  );
}

export function SkeletonOutfit({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white rounded-2xl border-2 border-[var(--color-border)] overflow-hidden ${className}`}>
      <div className="aspect-[3/4] skeleton" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-6 w-3/4" />
        <div className="skeleton h-4 w-full" />
        <div className="flex gap-2">
          <div className="skeleton h-8 w-20 rounded-full" />
          <div className="skeleton h-8 w-20 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonProfile({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white rounded-2xl border-2 border-[var(--color-border)] p-6 ${className}`}>
      <div className="flex items-center gap-4 mb-6">
        <div className="skeleton h-16 w-16 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-6 w-32" />
          <div className="skeleton h-4 w-48" />
        </div>
      </div>
      <div className="space-y-3">
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-5/6" />
        <div className="skeleton h-4 w-4/5" />
      </div>
    </div>
  );
}

export function SkeletonButton({ className = '' }: { className?: string }) {
  return <div className={`skeleton h-12 rounded-xl ${className}`} />;
}

export function SkeletonImage({ className = '', aspectRatio = 'square' }: { className?: string; aspectRatio?: 'square' | '16/9' | '4/3' | '3/4' }) {
  const ratioClass = {
    square: 'aspect-square',
    '16/9': 'aspect-video',
    '4/3': 'aspect-[4/3]',
    '3/4': 'aspect-[3/4]',
  }[aspectRatio];

  return <div className={`skeleton ${ratioClass} rounded-lg ${className}`} />;
}

export function SkeletonList({ count = 3, className = '' }: { count?: number; className?: string }) {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="skeleton h-12 w-12 rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-4 w-3/4" />
            <div className="skeleton h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonGrid({ count = 6, columns = 3, className = '' }: { count?: number; columns?: number; className?: string }) {
  const gridClass = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  }[columns] || 'grid-cols-3';

  return (
    <div className={`grid gap-6 ${gridClass} ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] py-12">
      <div className="ff-container max-w-6xl">
        <div className="skeleton h-12 w-64 mb-8" />
        <div className="skeleton h-6 w-96 mb-12" />
        <SkeletonGrid count={6} columns={3} />
      </div>
    </div>
  );
}
