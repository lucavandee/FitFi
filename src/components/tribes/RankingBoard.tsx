import React from 'react';
export type RankingItem = { name: string; score: number; delta?: number };
export default function RankingBoard({ items = [] as RankingItem[] }) {
  const data = items.length ? items : [
    { name: 'Clean Minimalists', score: 1280, delta: +12 },
    { name: 'Urban Athleisure',  score:  963, delta:  -3 },
    { name: 'Smart Casual NL',   score:  847, delta:  +5 },
  ];
  return (
    <section aria-label="Tribe ranking">
      <h3 className="text-base font-semibold text-[#0D1B2A] mb-3">Top tribes</h3>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr><th className="text-left px-4 py-3">Tribe</th><th className="text-right px-4 py-3">Score</th><th className="text-right px-4 py-3">Δ</th></tr>
          </thead>
          <tbody>
            {data.map((r,i)=>(
              <tr key={i} className="border-t border-slate-100">
                <td className="px-4 py-3 text-[#0D1B2A] font-medium">{r.name}</td>
                <td className="px-4 py-3 text-right tabular-nums">{r.score}</td>
                <td className={`px-4 py-3 text-right tabular-nums ${ (r.delta ?? 0) >= 0 ? 'text-green-600':'text-red-600'}`}>
                  {typeof r.delta === 'number' ? (r.delta>0?`+${r.delta}`:`${r.delta}`) : '–'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
