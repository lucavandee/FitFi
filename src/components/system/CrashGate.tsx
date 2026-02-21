import React from "react";
import { RefreshCw, Home, ArrowLeft, Mail } from "lucide-react";

function CrashOverlay({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="fixed inset-0 z-[2147483647] bg-[var(--color-bg)] flex items-center justify-center p-6 overflow-auto">
      <div className="max-w-md w-full text-center">
        <div className="w-14 h-14 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center mx-auto mb-6">
          <RefreshCw className="w-6 h-6 text-[var(--color-muted)]" />
        </div>

        <h2 className="text-2xl font-bold text-[var(--color-text)] mb-2">
          Oeps — dit ging mis aan onze kant.
        </h2>
        <p className="text-sm text-[var(--color-muted)] mb-1">
          Vernieuw de pagina. Als het blijft gebeuren: ga terug en probeer opnieuw.
        </p>
        <p className="text-sm text-[var(--color-muted)] mb-8">
          Je antwoorden zijn waarschijnlijk opgeslagen.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => window.location.reload()}
            className="flex-1 inline-flex items-center justify-center gap-2 py-3 bg-[var(--ff-color-primary-700)] text-white rounded-xl text-sm font-bold hover:bg-[var(--ff-color-primary-600)] transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Vernieuw
          </button>
          <button
            onClick={onRetry}
            className="flex-1 inline-flex items-center justify-center gap-2 py-3 border border-[var(--color-border)] text-[var(--color-text)] rounded-xl text-sm font-semibold hover:border-[var(--ff-color-primary-400)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Probeer opnieuw
          </button>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <a
            href="/"
            className="flex-1 inline-flex items-center justify-center gap-2 py-3 border border-[var(--color-border)] text-[var(--color-text)] rounded-xl text-sm font-semibold hover:border-[var(--ff-color-primary-400)] transition-colors"
          >
            <Home className="w-4 h-4" />
            Naar start
          </a>
          <a
            href="/contact"
            className="flex-1 inline-flex items-center justify-center gap-2 py-3 border border-[var(--color-border)] text-[var(--color-muted)] rounded-xl text-sm font-semibold hover:border-[var(--ff-color-primary-400)] hover:text-[var(--color-text)] transition-colors"
          >
            <Mail className="w-4 h-4" />
            Contact opnemen
          </a>
        </div>

        <p className="mt-6 text-xs text-[var(--color-muted)]">
          Probeer het later nog eens als het probleem aanhoudt.
        </p>
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
    console.error("[CrashGate]", error);
  }

  private handleRetry = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return <CrashOverlay onRetry={this.handleRetry} />;
    }
    return this.props.children as React.ReactElement;
  }
}
