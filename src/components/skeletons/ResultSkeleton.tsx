import React from 'react';

type Props = { count?: number };

export default function ResultSkeleton({ count = 6 }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          aria-busy="true"
          aria-label="Outfit wordt geladen"
        >
          <div className="aspect-[4/3] w-full animate-pulse rounded-xl bg-black/10 dark:bg-white/10" />
          <div className="mt-3 h-4 w-3/4 animate-pulse rounded bg-black/10 dark:bg-white/10" />
          <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-black/10 dark:bg-white/10" />
        </div>
      ))}
    </div>
  );
}