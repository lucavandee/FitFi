import React, { lazy, Suspense, useState } from 'react';
import AppPortal from '@/components/layout/AppPortal';
import { X } from 'lucide-react';

const NovaChat = lazy(() => import('./NovaChat'));

export default function NovaBubble() {
  const [open, setOpen] = useState(true);
  if (!open) return null;

  return (
    <AppPortal>
      <div className="fixed right-4 bottom-4 z-[9999] sm:right-6 sm:bottom-6">
        <div className="w-[min(92vw,420px)] h-[min(78vh,640px)] rounded-2xl bg-slate-900/95 text-white border border-white/10 shadow-2xl backdrop-blur flex flex-col overflow-hidden">
          <header className="flex items-center justify-between px-4 py-3 bg-white/5">
            <div className="font-semibold">Nova AI</div>
            <button
              aria-label="Sluit"
              className="p-1 rounded hover:bg-white/10"
              onClick={() => setOpen(false)}
            >
              <X size={18} />
            </button>
          </header>

          <main className="flex-1 min-h-0">
            <Suspense fallback={<div className="p-4 text-white/60">Nova laden…</div>}>
              <NovaChat />
            </Suspense>
          </main>
        </div>
      </div>
    </AppPortal>
  );
}