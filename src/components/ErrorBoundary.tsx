import React, { Component, ErrorInfo, ReactNode } from "react";

type Props = { children: ReactNode };
type State = { hasError: boolean; error: Error | null; info: ErrorInfo | null };

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null, info: null };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Basale logging zonder PII
    console.error("[ErrorBoundary]", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center ff-container">
          <div className="max-w-lg text-center">
            <h1 className="text-2xl font-semibold text-[var(--color-text)]">Er ging iets mis</h1>
            <p className="mt-2 text-[var(--color-muted)]">
              Vernieuw de pagina of ga terug naar de homepage.
            </p>
            <div className="mt-4 flex gap-2 justify-center">
              <button onClick={() => window.location.reload()} className="px-3 h-9 inline-flex items-center rounded-lg border border-[var(--color-border)] text-[var(--color-text)]">
                Vernieuwen
              </button>
              <a href="/" className="px-3 h-9 inline-flex items-center rounded-lg text-white" style={{ background: "var(--ff-color-primary-700)" }}>
                Naar home
              </a>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}