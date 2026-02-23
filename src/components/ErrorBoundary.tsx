import React, { Component, ErrorInfo, ReactNode } from "react";
import { RefreshCw, WifiOff, ServerCrash, AlertTriangle, ArrowLeft, Home } from "lucide-react";

type Props = { children: ReactNode };
type State = { hasError: boolean; error: Error | null; info: ErrorInfo | null; retryCount: number };

function classifyError(error: Error | null): "network" | "server" | "render" {
  if (!error) return "render";
  const msg = error.message?.toLowerCase() ?? "";
  if (msg.includes("fetch") || msg.includes("network") || msg.includes("failed to fetch") || msg.includes("networkerror")) return "network";
  if (msg.includes("500") || msg.includes("503") || msg.includes("server")) return "server";
  return "render";
}

const ERROR_COPY = {
  network: {
    icon: WifiOff,
    title: "Geen verbinding",
    body: "De verbinding met onze servers is verbroken. Controleer je internet en probeer opnieuw.",
    hint: "Jouw voortgang is lokaal opgeslagen — je verliest niets.",
  },
  server: {
    icon: ServerCrash,
    title: "Serverfout",
    body: "Onze server heeft een tijdelijk probleem. Dit is aan onze kant en we werken eraan.",
    hint: "Probeer het over enkele minuten opnieuw.",
  },
  render: {
    icon: AlertTriangle,
    title: "Er ging iets mis",
    body: "Een onderdeel van de pagina kon niet worden geladen.",
    hint: "Vernieuw de pagina of ga terug en probeer opnieuw.",
  },
};

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null, info: null, retryCount: 0 };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info);
    this.setState({ info });
  }

  private handleRetry = () => {
    this.setState((s) => ({ hasError: false, error: null, info: null, retryCount: s.retryCount + 1 }));
  };

  render() {
    if (this.state.hasError) {
      const kind = classifyError(this.state.error);
      const { icon: Icon, title, body, hint } = ERROR_COPY[kind];

      return (
        <div
          role="alert"
          aria-live="assertive"
          className="min-h-[60vh] flex items-center justify-center ff-container px-4"
        >
          <div className="max-w-md w-full text-center">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5 ${
              kind === "network"
                ? "bg-[var(--ff-color-warning-50)] border border-[var(--ff-color-warning-200)]"
                : kind === "server"
                ? "bg-[var(--ff-color-danger-50)] border border-[var(--ff-color-danger-200)]"
                : "bg-[var(--color-surface)] border border-[var(--color-border)]"
            }`}>
              <Icon
                className={`w-6 h-6 ${
                  kind === "network"
                    ? "text-[var(--ff-color-warning-600)]"
                    : kind === "server"
                    ? "text-[var(--ff-color-danger-600)]"
                    : "text-[var(--color-muted)]"
                }`}
                aria-hidden="true"
              />
            </div>

            <h2 className="text-xl font-bold text-[var(--color-text)] mb-2">{title}</h2>
            <p className="text-sm text-[var(--color-muted)] mb-1">{body}</p>
            <p className="text-xs text-[var(--color-muted)] mb-6">{hint}</p>

            <div className="flex flex-wrap gap-2.5 justify-center">
              <button
                onClick={this.handleRetry}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--ff-color-primary-700)] text-white text-sm font-bold hover:bg-[var(--ff-color-primary-600)] transition-colors"
              >
                <RefreshCw className="w-4 h-4" aria-hidden="true" />
                Probeer opnieuw
              </button>
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[var(--color-border)] text-[var(--color-text)] text-sm font-semibold hover:border-[var(--ff-color-primary-400)] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                Terug
              </button>
              <a
                href="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[var(--color-border)] text-[var(--color-text)] text-sm font-semibold hover:border-[var(--ff-color-primary-400)] transition-colors"
              >
                <Home className="w-4 h-4" aria-hidden="true" />
                Naar start
              </a>
            </div>

            {this.state.retryCount > 1 && (
              <p className="mt-5 text-xs text-[var(--color-muted)]">
                Blijft het fout gaan?{" "}
                <a href="/contact" className="underline hover:text-[var(--color-text)] transition-colors">
                  Neem contact op
                </a>
              </p>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
