import React from 'react';
import { isSupabaseEnabled } from '@/lib/supabase';

export default function HealthCheckPage() {
  const gtag = typeof window !== 'undefined' && typeof (window as any).gtag === 'function';

  const rows: Array<{ k: string; v: any }> = [
    { k: 'MODE', v: import.meta.env.MODE },
    { k: 'VITE_USE_SUPABASE', v: String(import.meta.env.VITE_USE_SUPABASE ?? 'undefined') },
    { k: 'Supabase enabled', v: String(isSupabaseEnabled) },
    { k: 'GTAG present', v: String(gtag) },
    { k: 'Build time', v: new Date().toISOString() },
  ];

  return (
    <div className="min-h-[70vh] max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">FitFi • HealthCheck</h1>
      <div className="rounded-2xl border p-4 bg-white">
        <table className="w-full text-sm">
          <tbody>
            {rows.map((r) => (
              <tr key={r.k} className="border-b last:border-none">
                <td className="py-2 pr-4 font-medium">{r.k}</td>
                <td className="py-2 text-gray-700">{String(r.v)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-sm text-gray-500">Gebruik deze pagina om env/integraties te checken i.p.v. in het donker zoeken.</p>
    </div>
  );
}