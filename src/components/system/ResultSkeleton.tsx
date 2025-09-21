import React from "react";
import Card from "@/components/ui/Card";

/** Skeleton voor resultaten, tokens-first */
function ResultSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="p-4">
          <div className="h-44 w-full rounded-md bg-[var(--overlay-accent-08a)] animate-pulse mb-4" />
          <div className="h-4 w-2/3 rounded-md bg-[var(--overlay-accent-08a)] animate-pulse mb-2" />
          <div className="h-4 w-1/2 rounded-md bg-[var(--overlay-accent-08a)] animate-pulse" />
        </Card>
      ))}
    </div>
  );
}

export default ResultSkeleton;