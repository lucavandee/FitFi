import React from "react";

type Props = { children: React.ReactNode };
type State = { hasError: boolean; error?: any };

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, info: any) {
    // eslint-disable-next-line no-console
    console.error("[ErrorBoundary]", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[color:var(--ff-surface)]">
          <div className="ff-card text-center">
            <h1 className="text-xl font-semibold text-[color:var(--ff-midnight)] mb-2">Er ging iets mis</h1>
            <p className="ff-subtle">Herlaad de pagina of ga terug naar de homepagina.</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}