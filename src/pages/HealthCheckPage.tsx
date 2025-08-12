import React from 'react';
import { isPreview, disableMigrations, muteThirdParty, appsignalEnabled, Env } from '@/utils/env';

export default function HealthCheckPage() {
  const rows = [
    ['MODE', Env.mode],
    ['Host', Env.host],
    ['Preview', String(isPreview)],
    ['Disable migrations', String(disableMigrations)],
    ['Mute third-party', String(muteThirdParty)],
    ['AppSignal enabled', String(appsignalEnabled)],
    ['Build', new Date().toISOString()],
  ];

  return (
    <div className="min-h-[70vh] max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">FitFi • HealthCheck</h1>
      <div className="rounded-2xl border p-4 bg-white">
        <table className="w-full text-sm">
          <tbody>
            {rows.map(([k, v]) => (
              <tr key={k as string} className="border-b last:border-none">
                <td className="py-2 pr-4 font-medium">{k as string}</td>
                <td className="py-2 text-gray-700">{String(v)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-sm text-gray-500">Gebruik deze pagina om env/integraties te checken i.p.v. in het donker zoeken.</p>
    </div>
  );
}