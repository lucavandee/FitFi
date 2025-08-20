import React from 'react';

export type RankingItem = { name: string; score: number; delta?: number };
type Props = { items?: RankingItem[]; title?: string; className?: string };

const MOCK: RankingItem[] = [
  { name: 'Clean Minimalists', score: 1280, delta: +12 },
  { name: 'Urban Athleisure',  score:  963, delta:  -3 },
  { name: 'Smart Casual NL',   score:  847, delta:  +5 },
];

export default function RankingBoard({ items, title = 'Top tribes', className = '' }: Props) {
  const data = (items && items.length)
    ? items
    : (import.meta.env.VITE_USE_MOCK_DATA === 'true' ? MOCK : []);

  return (
    <section aria-label="Tribe ranking" className={className}>
      <h3 className="text-base font-semibold text-[#0D1B2A] mb-3">{title}</h3>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(13,27,42,0.06)]">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left px-4 py-3">Tribe</th>
              <th className="text-right px-4 py-3">Score</th>
              <th className="text-right px-4 py-3">Δ</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr><td colSpan={3} className="px-4 py-6 text-center text-slate-500">Nog geen data</td></tr>
            ) : data.map((r, i) => {
              const deltaClass = (r.delta ?? 0) >= 0 ? 'text-green-600' : 'text-red-600';
              return (
                <tr key={i} className="border-t border-slate-100">
                  <td className="px-4 py-3 text-[#0D1B2A] font-medium">{r.name}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{r.score}</td>
                  <td className={`px-4 py-3 text-right tabular-nums ${deltaClass}`}>
                    {typeof r.delta === 'number' ? (r.delta > 0 ? `+${r.delta}` : `${r.delta}`) : '–'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
