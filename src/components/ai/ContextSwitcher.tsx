import React from 'react';
import { track } from '@/utils/analytics';

type Mode = 'outfits' | 'archetype' | 'shop';
type Props = { defaultMode?: Mode; className?: string; };

export default function ContextSwitcher({ defaultMode = 'outfits', className }: Props) {
  const [mode, setMode] = React.useState<Mode>(defaultMode);

  const select = (m: Mode) => {
    setMode(m);
    window.dispatchEvent(new CustomEvent('nova:set-context', { detail: { mode: m } }));
    track?.('nova_context_change', { mode: m });
  };

  const btn = (m: Mode, label: string) => (
    <button
      key={m}
      onClick={() => select(m)}
      className={[
        'px-3 py-1.5 rounded-full text-sm transition',
        mode === m
          ? 'bg-[var(--ff-color-primary-50)] text-[var(--color-text)] shadow-[0_1px_6px_rgba(13,27,42,0.06)]'
          : 'text-gray-600 hover:bg-black/5'
      ].join(' ')}
      aria-pressed={mode === m}
      role="tab"
    >
      {label}
    </button>
  );

  return (
    <div className={`flex items-center gap-2 ${className ?? ''}`} role="tablist" aria-label="Nova context">
      {btn('outfits','Outfits')}
      {btn('archetype','Archetype')}
      {btn('shop','Shop')}
    </div>
  );
}