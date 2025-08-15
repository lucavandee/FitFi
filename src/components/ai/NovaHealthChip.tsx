import React from 'react';

export default function NovaHealthChip({
  status, model, ttfbMs, traceId,
}: {
  status: 'idle'|'connecting'|'streaming'|'done'|'error';
  model?: string; ttfbMs?: number; traceId?: string;
}) {
  const color = status === 'error' ? 'bg-red-500'
              : status === 'done' ? 'bg-emerald-500'
              : status === 'streaming' ? 'bg-sky-500'
              : status === 'connecting' ? 'bg-amber-500'
              : 'bg-gray-400';
  const label = status === 'error' ? 'Error'
              : status === 'done' ? 'Connected'
              : status === 'streaming' ? 'Streaming'
              : status === 'connecting' ? 'Connecting'
              : 'Idle';
  const tid = traceId ? `${traceId.slice(0,6)}…` : '';

  return (
    <div className="flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs text-ink bg-white/70">
      <span className={`inline-block h-2 w-2 rounded-full ${color}`} />
      <span className="font-medium">{label}</span>
      {model && <span className="text-gray-500">• {model}</span>}
      {typeof ttfbMs === 'number' && <span className="text-gray-500">• {ttfbMs}ms</span>}
      {tid && <span className="text-gray-400">• {tid}</span>}
    </div>
  );
}