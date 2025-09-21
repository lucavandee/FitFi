import React from "react";

/** Premium skeleton: luchtig en tokens-first */
function ResultSkeleton() {
  return (
    <div className="w-full">
      <div className="rounded-2xl bg-[var(--color-surface)] shadow-[var(--shadow-soft)] p-6 md:p-8">
        <div className="h-4 w-28 rounded-md bg-[var(--overlay-accent-08a)] animate-pulse" />
        <div className="mt-4 h-6 w-2/3 rounded-md bg-[var(--overlay-accent-08a)] animate-pulse" />
        <div className="mt-2 h-4 w-3/4 rounded-md bg-[var(--overlay-accent-08a)] animate-pulse" />
        <div className="mt-6 h-8 w-40 rounded-md bg-[var(--overlay-accent-08a)] animate-pulse" />
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-soft)] overflow-hidden"
          >
            <div className="h-60 w-full bg-[var(--overlay-accent-08a)] animate-pulse" />
            <div className="p-5">
              <div className="h-4 w-1/2 bg-[var(--overlay-accent-08a)] rounded-md animate-pulse" />
              <div className="mt-2 h-4 w-2/3 bg-[var(--overlay-accent-08a)] rounded-md animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ResultSkeleton;