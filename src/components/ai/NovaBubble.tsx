import React, { lazy, Suspense, useEffect, useState, useRef } from 'react';
import AppPortal from '@/components/layout/AppPortal';
import { X } from 'lucide-react';
import ContextSwitcher from '@/components/ai/ContextSwitcher';
import SuggestionChips from '@/components/ai/SuggestionChips';

const NovaChat = lazy(() => import('./NovaChat'));

const LS_KEY = 'fitfi.nova.dismissedAt';
const isMobile = () => window.matchMedia && window.matchMedia('(max-width: 767px)').matches;

export default function NovaBubble() {
  const [open, setOpen] = useState(false);
  const fabRef = useRef<HTMLButtonElement | null>(null);
  const [hasMessaged, setHasMessaged] = useState(false);

  useEffect(() => {
    const onMsg = () => setHasMessaged(true);
    window.addEventListener('nova:message', onMsg);
    return () => window.removeEventListener('nova:message', onMsg);
  }, []);

  useEffect(() => {
    const onOpen = () => {
      setOpen(true);
      localStorage.removeItem(LS_KEY);
    };
    const onClose = () => {
      setOpen(false);
      localStorage.setItem(LS_KEY, new Date().toISOString());
    };
    window.addEventListener('nova:open', onOpen);
    window.addEventListener('nova:close', onClose);
    return () => {
      window.removeEventListener('nova:open', onOpen);
      window.removeEventListener('nova:close', onClose);
    };
  }, []);

  // Prefetch NovaChat on desktop when idle
  useEffect(() => {
    if (!isMobile() && 'requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => import('./NovaChat'));
    }
  }, []);

  // Close on ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (!open) return null;

  const mobile = isMobile();

  return (
    <AppPortal id="nova-root">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[70]"
        role="presentation"
        onClick={() => setOpen(false)}
      />
      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="nova-title"
        className={
          mobile
            ? 'fixed left-0 right-0 bottom-0 z-[80] rounded-t-3xl bg-white shadow-2xl'
            : 'fixed right-4 bottom-4 sm:right-6 sm:bottom-6 z-[80] rounded-2xl bg-white shadow-2xl'
        }
        style={mobile ? { maxHeight: '72vh' } : { width: 'min(92vw,420px)', height: 'min(78vh,640px)' }}
      >
        <header className="flex items-center justify-between px-4 py-3 border-b">
          <h2 id="nova-title" className="font-semibold text-ink">Nova AI</h2>
          <button
            aria-label="Sluit Nova chat"
            onClick={() => setOpen(false)}
            className="p-2 rounded-full hover:bg-black/5 focus-ring"
          >
            <X size={18} />
          </button>
        </header>

        {/* Context & suggestions (first-open helper) */}
        {!hasMessaged && (
          <div className="px-4 pt-3 pb-2 border-b">
            <ContextSwitcher className="mb-3" />
            <SuggestionChips />
          </div>
        )}

        {/* Chat area */}
        <main className="flex flex-col min-h-0" style={mobile ? { height: 'calc(72vh - 56px)', paddingBottom: 'env(safe-area-inset-bottom)' } : { height: 'calc(min(78vh,640px) - 56px)' }}>
          <Suspense fallback={<div className="p-4 text-gray-500">Nova laden…</div>}>
            <NovaChat />
          </Suspense>
        </main>
      </div>
    </AppPortal>
  );
}