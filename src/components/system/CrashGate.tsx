import React from "react";

function CrashOverlay({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <div className="fixed inset-0 z-[2147483647] bg-text/95 text-surface p-6 overflow-auto">
      <div className="max-w-3xl mx-auto">
        <div className="mb-3 text-sm opacity-80">Nova • Crash Report</div>
        <h2 className="text-2xl font-semibold mb-4">Er ging iets mis</h2>
        <pre className="bg-surface border border-border rounded-lg p-4 whitespace-pre-wrap text-sm overflow-auto text-text">
          {String(error?.stack || error?.message || error)}
        </pre>
        <div className="mt-4 flex gap-2">
          <button
            className="px-3 h-9 rounded-md border border-border hover:bg-[color:color-mix(in_oklab,var(--color-surface) 92%,white)] focus:outline-none focus:ring-2 focus:ring-primary600 focus:ring-offset-2 focus:ring-offset-surface"
            onClick={onRetry}
          >
            Opnieuw proberen
          </button>
          <a
            className="px-3 h-9 rounded-md border border-border hover:bg-[color:color-mix(in_oklab,var(--color-surface) 92%,white)] focus:outline-none focus:ring-2 focus:ring-primary600 focus:ring-offset-2 focus:ring-offset-surface"
            href="mailto:team@fitfi.ai?subject=Crash%20Report"
          >
            Contact opnemen
          </a>
        </div>
      </div>
    </div>
  );
}

type CrashGateState = { error: Error | null };

export default class CrashGate extends React.Component<React.PropsWithChildren, CrashGateState> {
  state: CrashGateState = { error: null };

  static getDerivedStateFromError(error: Error): CrashGateState {
    return { error };
  }

  componentDidCatch(error: Error) {
    // eslint-disable-next-line no-console
    console.error("Uncaught error:", error);
  }

  private handleRetry = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return <CrashOverlay error={this.state.error} onRetry={this.handleRetry} />;
    }
    return this.props.children as React.ReactElement;
  }
}