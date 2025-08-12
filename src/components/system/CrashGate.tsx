import React, { Component, ReactNode, useEffect, useState } from 'react';

type BoundaryState = { error: Error | null };

class ErrorBoundary extends Component<{ children: ReactNode }, BoundaryState> {
  state: BoundaryState = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: any, info: any) {
    // Best-effort logging
    if (typeof window !== 'undefined' && (window as any).gtag) {
      try { (window as any).gtag('event', 'exception', { description: String(error?.message ?? error), fatal: false }); } catch {}
    }
    console.error('[CrashGate] boundary error', error, info);
  }
  render() {
    if (this.state.error) return <CrashOverlay error={this.state.error} />;
    return this.props.children;
  }
}

function CrashOverlay({ error }: { error: Error }) {
  const [copied, setCopied] = useState(false);
  const details = `${error?.message ?? 'Unknown error'}\n\n${error?.stack ?? ''}`;

  return (
    <div className="fixed inset-0 z-[9999] bg-[#0D1B2A] text-white p-6 overflow-auto">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm" style={{ background: 'rgba(137,207,240,0.15)', color: '#89CFF0' }}>
            Nova • Crash Report
          </div>
          <h1 className="mt-3 text-2xl font-semibold">Er ging iets mis</h1>
          <p className="mt-2 text-white/80">We tonen de fout zodat je snel kunt fixen i.p.v. een wit scherm.</p>
        </div>
        <pre className="bg-black/30 rounded-2xl p-4 text-sm whitespace-pre-wrap">{details}</pre>
        <div className="mt-4 flex gap-3">
          <button
            onClick={() => { navigator.clipboard?.writeText(details).then(() => setCopied(true)); }}
            className="px-4 py-2 rounded-full bg-white text-[#0D1B2A] font-medium"
          >
            {copied ? 'Gekopieerd ✓' : 'Kopieer foutdetails'}
          </button>
          <a href="/__health" className="px-4 py-2 rounded-full border border-white/30">Open HealthCheck</a>
        </div>
      </div>
    </div>
  );
}

export function CrashGate({ children }: { children: ReactNode }) {
  const [runtimeError, setRuntimeError] = useState<Error | null>(null);

  useEffect(() => {
    const onErr = (e: ErrorEvent) => setRuntimeError(e?.error ?? new Error(e?.message ?? 'Unknown runtime error'));
    const onRej = (e: PromiseRejectionEvent) => {
      const reason = (e && (e as any).reason) ?? 'Unhandled rejection';
      setRuntimeError(reason instanceof Error ? reason : new Error(String(reason)));
    };
    window.addEventListener('error', onErr);
    window.addEventListener('unhandledrejection', onRej);
    return () => {
      window.removeEventListener('error', onErr);
      window.removeEventListener('unhandledrejection', onRej);
    };
  }, []);

  if (runtimeError) return <CrashOverlay error={runtimeError} />;
  return <ErrorBoundary>{children}</ErrorBoundary>;
}

export default CrashGate;