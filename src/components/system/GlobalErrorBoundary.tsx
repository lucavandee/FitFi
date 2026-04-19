import React from "react";
import { RefreshCw, Home, ArrowLeft, Mail, WifiOff, ServerCrash, AlertTriangle } from "lucide-react";

type Props = { children: React.ReactNode };
type State = { hasError: boolean; error?: string; errorKind?: "network" | "server" | "render"; retryCount: number };

function classifyError(msg: string): "network" | "server" | "render" {
  const m = msg.toLowerCase();
  if (m.includes("fetch") || m.includes("network") || m.includes("failed to fetch") || m.includes("networkerror")) return "network";
  if (m.includes("500") || m.includes("503") || m.includes("server")) return "server";
  return "render";
}

const ERROR_COPY = {
  network: {
    icon: WifiOff,
    title: "Geen verbinding",
    body: "De verbinding met onze servers is verbroken. Controleer je internet en probeer opnieuw.",
    hint: "Je voortgang is lokaal opgeslagen — je verliest niets.",
    iconBg: "bg-[#FFFBEB] border-[#FDE68A]",
    iconColor: "text-[#D4913D]",
  },
  server: {
    icon: ServerCrash,
    title: "Serverfout",
    body: "Onze server heeft een tijdelijk probleem. Dit is aan onze kant en we werken eraan.",
    hint: "Probeer het over enkele minuten opnieuw.",
    iconBg: "bg-[#FEF2F2] border-[#FECACA]",
    iconColor: "text-[#C24A4A]",
  },
  render: {
    icon: AlertTriangle,
    title: "Er ging iets mis",
    body: "Een onderdeel van de pagina kon niet worden geladen.",
    hint: "Vernieuw de pagina of probeer het opnieuw.",
    iconBg: "bg-[#FFFFFF] border-[#E5E5E5]",
    iconColor: "text-[#8A8A8A]",
  },
};

export default class GlobalErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, retryCount: 0 };

  static getDerivedStateFromError(error: any): Partial<State> {
    const msg = String(error?.message || error || "");
    return { hasError: true, error: msg, errorKind: classifyError(msg) };
  }

  componentDidCatch(error: any, info: any) {
    console.error("[GlobalErrorBoundary]", error, info?.componentStack);
  }

  private handleRetry = () => {
    this.setState((s) => ({ hasError: false, error: undefined, errorKind: undefined, retryCount: s.retryCount + 1 }));
  };

  render() {
    if (this.state.hasError) {
      const kind = this.state.errorKind ?? "render";
      const { icon: Icon, title, body, hint, iconBg, iconColor } = ERROR_COPY[kind];

      return (
        <div
          role="alert"
          aria-live="assertive"
          className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-6"
        >
          <div className="max-w-md w-full text-center">
            <div className={`w-14 h-14 rounded-full border flex items-center justify-center mx-auto mb-6 ${iconBg}`}>
              <Icon className={`w-6 h-6 ${iconColor}`} aria-hidden="true" />
            </div>

            <h1
              tabIndex={-1}
              ref={(el) => el?.focus()}
              className="text-2xl font-bold text-[#1A1A1A] mb-2 outline-none"
            >
              {title}
            </h1>
            <p className="text-sm text-[#8A8A8A] mb-1">{body}</p>
            <p className="text-sm text-[#8A8A8A] mb-8">{hint}</p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 bg-[#A8513A] text-white rounded-xl text-sm font-bold hover:bg-[#C2654A] transition-colors"
              >
                <RefreshCw className="w-4 h-4" aria-hidden="true" />
                Vernieuw pagina
              </button>
              <button
                onClick={this.handleRetry}
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 border border-[#E5E5E5] text-[#1A1A1A] rounded-xl text-sm font-semibold hover:border-[#D4856E] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                Probeer opnieuw
              </button>
            </div>

            <div className="mt-3 flex flex-col sm:flex-row gap-3">
              <a
                href="/dashboard"
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 border border-[#E5E5E5] text-[#1A1A1A] rounded-xl text-sm font-semibold hover:border-[#D4856E] transition-colors"
              >
                <Home className="w-4 h-4" aria-hidden="true" />
                Naar dashboard
              </a>
              <a
                href="/contact"
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 border border-[#E5E5E5] text-[#8A8A8A] rounded-xl text-sm font-semibold hover:border-[#D4856E] hover:text-[#1A1A1A] transition-colors"
              >
                <Mail className="w-4 h-4" aria-hidden="true" />
                Contact
              </a>
            </div>

            {this.state.retryCount > 1 && (
              <p className="mt-6 text-xs text-[#8A8A8A]">
                Blijft het fout gaan? Neem{" "}
                <a href="/contact" className="underline hover:text-[#1A1A1A] transition-colors">
                  contact
                </a>{" "}
                met ons op.
              </p>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
