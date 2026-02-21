import React from "react";
import { RefreshCw, Home, ArrowLeft, Mail } from "lucide-react";

type Props = { children: React.ReactNode };
type State = { hasError: boolean; error?: string };

export default class GlobalErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: any): State {
    return { hasError: true, error: String(error?.message || error) };
  }

  componentDidCatch(error: any, info: any) {
    console.error("[GlobalErrorBoundary]", error, info?.componentStack);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          aria-live="assertive"
          className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-6"
        >
          <div className="max-w-md w-full text-center">
            <div className="w-14 h-14 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center mx-auto mb-6">
              <RefreshCw className="w-6 h-6 text-[var(--color-muted)]" aria-hidden="true" />
            </div>

            <h1
              tabIndex={-1}
              ref={(el) => el?.focus()}
              className="text-2xl font-bold text-[var(--color-text)] mb-2 outline-none"
            >
              Er ging iets mis.
            </h1>
            <p className="text-sm text-[var(--color-muted)] mb-1">
              Vernieuw de pagina of probeer het opnieuw.
            </p>
            <p className="text-sm text-[var(--color-muted)] mb-8">
              We kunnen dit nu niet laden. Probeer later nog eens.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 bg-[var(--ff-color-primary-700)] text-white rounded-xl text-sm font-bold hover:bg-[var(--ff-color-primary-600)] transition-colors"
              >
                <RefreshCw className="w-4 h-4" aria-hidden="true" />
                Vernieuw
              </button>
              <button
                onClick={this.handleRetry}
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 border border-[var(--color-border)] text-[var(--color-text)] rounded-xl text-sm font-semibold hover:border-[var(--ff-color-primary-400)] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                Probeer opnieuw
              </button>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <a
                href="/dashboard"
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 border border-[var(--color-border)] text-[var(--color-text)] rounded-xl text-sm font-semibold hover:border-[var(--ff-color-primary-400)] transition-colors"
              >
                <Home className="w-4 h-4" aria-hidden="true" />
                Naar dashboard
              </a>
              <a
                href="/contact"
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 border border-[var(--color-border)] text-[var(--color-muted)] rounded-xl text-sm font-semibold hover:border-[var(--ff-color-primary-400)] hover:text-[var(--color-text)] transition-colors"
              >
                <Mail className="w-4 h-4" aria-hidden="true" />
                Contact
              </a>
            </div>

            <p className="mt-6 text-xs text-[var(--color-muted)]">
              Probeer het later nog eens als het probleem aanhoudt.
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
