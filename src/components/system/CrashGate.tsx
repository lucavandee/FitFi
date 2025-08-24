import React, { Component, ReactNode, useEffect, useState } from "react";

type BoundaryState = { error: Error | null };

class ErrorBoundary extends Component<{ children: ReactNode }, BoundaryState> {
  state: BoundaryState = { error: null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: any, info: any) {
    // Best-effort logging
    if (typeof window !== "undefined" && (window as any).gtag) {
      try {
        (window as any).gtag("event", "exception", {
          description: String(error?.message ?? error),
          fatal: false,
        });
      } catch {}
    }
    console.error("[CrashGate] boundary error", error, info);
  }
  render() {
    if (this.state.error)
      return (
        <CrashOverlay
          error={this.state.error}
          onRetry={() => this.setState({ error: null })}
        />
      );
    return this.props.children;
  }
}

function CrashOverlay({
  error,
  onRetry,
}: {
  error: Error;
  onRetry: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const details = `${error?.message ?? "Unknown error"}\n\n${error?.stack ?? ""}`;

  return (
    <div className="fixed inset-0 z-[var(--ff-z-nova)] bg-[var(--ff-midnight-900)] text-white p-6 overflow-auto">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-[var(--ff-sky-300)]/15 text-[var(--ff-sky-300)]">
            Nova • Crash Report
          </div>
          <h1 className="mt-3 text-2xl font-semibold">Er ging iets mis</h1>
          <p className="mt-2 text-white/80">
            We tonen de fout zodat je snel kunt herstellen in plaats van een wit
            scherm.
          </p>
        </div>
        <pre className="bg-black/30 rounded-[var(--ff-radius-xl)] p-4 text-sm whitespace-pre-wrap overflow-auto max-h-64">
          {details}
        </pre>
        <div className="mt-4 flex gap-3">
          <button
            onClick={() => {
              navigator.clipboard
                ?.writeText(details)
                .then(() => setCopied(true));
            }}
            className="px-4 py-2 rounded-full bg-white text-[var(--ff-midnight-900)] font-medium hover:bg-gray-100 transition-colors"
          >
            {copied ? "Gekopieerd ✓" : "Kopieer foutdetails"}
          </button>
          <button
            onClick={onRetry}
            className="px-4 py-2 rounded-full border border-white/30 hover:bg-white/10 transition-colors"
          >
            Probeer opnieuw
          </button>
          <a
            href="/__health"
            className="px-4 py-2 rounded-full border border-white/30 hover:bg-white/10 transition-colors"
          >
            Open HealthCheck
          </a>
        </div>
      </div>
    </div>
  );
}

export function CrashGate({ children }: { children: ReactNode }) {
  const [runtimeError, setRuntimeError] = useState<Error | null>(null);

  useEffect(() => {
    const onErr = (e: ErrorEvent) =>
      setRuntimeError(
        e?.error ?? new Error(e?.message ?? "Unknown runtime error"),
      );
    const onRej = (e: PromiseRejectionEvent) => {
      const reason = (e && (e as any).reason) ?? "Unhandled rejection";
      setRuntimeError(
        reason instanceof Error ? reason : new Error(String(reason)),
      );
    };
    window.addEventListener("error", onErr);
    window.addEventListener("unhandledrejection", onRej);
    return () => {
      window.removeEventListener("error", onErr);
      window.removeEventListener("unhandledrejection", onRej);
    };
  }, []);

  if (runtimeError) return <CrashOverlay error={runtimeError} />;
  return <ErrorBoundary>{children}</ErrorBoundary>;
}

export default CrashGate;
