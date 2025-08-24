import React from "react";

export type FunnelStage = { label: string; value: number };

type Props = { data?: FunnelStage[] };

export default function FunnelVisualizer({ data = [] }: Props) {
  const items = data.length
    ? data
    : [
        { label: "Bezoeken", value: 1000 },
        { label: "Quiz gestart", value: 620 },
        { label: "Quiz voltooid", value: 410 },
        { label: "Report bekeken", value: 260 },
        { label: "Klik naar shop", value: 120 },
      ];
  const max = Math.max(1, ...items.map((i) => i.value));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <h3 className="text-base font-semibold text-[#0D1B2A] mb-3">Funnel</h3>
      <ol className="space-y-2">
        {items.map((s, i) => {
          const pct = Math.round((s.value / max) * 100);
          return (
            <li key={i} className="flex items-center gap-3">
              <div className="w-32 shrink-0 text-sm text-slate-700">
                {s.label}
              </div>
              <div className="flex-1 h-3 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-[#9BD4F4]"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="w-14 text-right text-sm text-slate-700 tabular-nums">
                {s.value}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
