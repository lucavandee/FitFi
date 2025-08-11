import React from 'react';

export default function OutfitReasons({ matchPct, seasonLabel, colorHint }: { matchPct: number; seasonLabel: string; colorHint?: string; }) {
  return (
    <div className="mt-2 flex flex-wrap gap-2 text-sm text-muted-foreground">
      <span className="rounded-full border px-2 py-0.5">Match {Math.round(matchPct)}%</span>
      <span className="rounded-full border px-2 py-0.5">{seasonLabel}</span>
      {colorHint && <span className="rounded-full border px-2 py-0.5">{colorHint}</span>}
    </div>
  );
}