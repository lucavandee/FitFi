import React, { lazy, Suspense, useEffect, useState, useRef } from 'react';
import AppPortal from '@/components/layout/AppPortal';
import { X, ChevronDown } from 'lucide-react';
import ContextSwitcher from '@/components/ai/ContextSwitcher';
import SuggestionChips from '@/components/ai/SuggestionChips';
import { NovaConnectionProvider, useNovaConn } from '@/components/ai/NovaConnection';
import NovaHealthChip from '@/components/ai/NovaHealthChip';
import NovaTierBadge from '@/components/ai/NovaTierBadge';
import { useSwipeToClose } from '@/hooks/useSwipeToClose';

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

  const { elementRef, deltaY, opacity, isDragging } = useSwipeToClose({
    onClose: () => setOpen(false),
    threshold: 120,
    enabled: mobile && open,
  });

  const panel = (
    <div
      ref={elementRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="nova-title"
      className={
        mobile
          ? 'fixed left-0 right-0 bottom-0 z-[80] rounded-t-3xl bg-white shadow-2xl'
          : 'fixed right-4 bottom-4 sm:right-6 sm:bottom-6 z-[80] rounded-2xl bg-white shadow-2xl'
      }
      style={{
        ...(mobile
          ? { height: 'min(72vh, 640px)' }
          : { width: 'min(92vw, 420px)', height: 'min(78vh, 640px)' }),
        transform: mobile ? `translateY(${deltaY}px)` : undefined,
        opacity: mobile ? opacity : 1,
        transition: isDragging ? 'none' : 'transform 0.3s ease-out, opacity 0.3s ease-out',
      }}
    >
      <div className="flex flex-col h-full">
        {/* Swipe handle - only on mobile */}
        {mobile && (
          <div className="flex justify-center py-2 border-b border-gray-100">
            <div className="flex flex-col items-center gap-1">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        )}

        <header className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-3">
            <h2 id="nova-title" className="font-semibold text-ink">Nova AI</h2>
            <NovaTierBadge />
          </div>
          <div className="flex items-center gap-3">
            <NovaHeaderChipBridge />
            <button
              aria-label="Sluit Nova chat"
              onClick={() => setOpen(false)}
              className="p-2 rounded-full hover:bg-black/5 focus-ring"
            >
              <X size={18} />
            </button>
          </div>
        </header>

        {/* Suggestions blokkie telt nu mee in de kolom */}
        {!hasMessaged && (
          <div className="px-4 pt-3 pb-2 border-b shrink-0">
            <ContextSwitcher className="mb-3" />
            <SuggestionChips />
          </div>
        )}

        {/* Chat area vult de rest, input blijft zichtbaar */}
        <div className="flex-1 min-h-0">
          <Suspense fallback={<div className="p-4 text-gray-500">Nova laden…</div>}>
            <NovaChat />
          </Suspense>
        </div>
      </div>
    </div>
  );

  return (
    <AppPortal id="nova-root">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[70]"
        role="presentation"
        onClick={() => setOpen(false)}
      />
      
      {/* Panel with Connection Provider */}
      <NovaConnectionProvider>
        {panel}
      </NovaConnectionProvider>
    </AppPortal>
  );
}

// Kleine bridge die de context leest en chip rendert
function NovaHeaderChipBridge() {
  const { status, model, ttfbMs, traceId } = useNovaConn();
  return <NovaHealthChip status={status} model={model} ttfbMs={ttfbMs} traceId={traceId} />;
}