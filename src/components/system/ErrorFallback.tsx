import React from "react";
import { RefreshCw, ArrowLeft, Home, Mail } from "lucide-react";
import { cn } from "@/utils/cn";

interface Props {
  onRetry?: () => void;
  title?: string;
  description?: string;
  showBack?: boolean;
  compact?: boolean;
}

export default function ErrorFallback({
  onRetry,
  title = "Oeps — dit ging mis aan onze kant.",
  description = "Vernieuw de pagina of ga terug en probeer opnieuw.",
  showBack = true,
  compact = false,
}: Props) {
  return (
    <div
      className={cn(
        "flex items-center justify-center bg-[var(--color-bg)]",
        compact ? "py-12 px-4" : "min-h-[60vh] px-6"
      )}
    >
      <div className={cn("w-full text-center", compact ? "max-w-sm" : "max-w-md")}>
        <div className="w-12 h-12 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center mx-auto mb-5">
          <RefreshCw className="w-5 h-5 text-[var(--color-muted)]" />
        </div>

        <h2 className={cn("font-bold text-[var(--color-text)] mb-2", compact ? "text-lg" : "text-xl")}>
          {title}
        </h2>
        <p className="text-sm text-[var(--color-muted)] mb-1">{description}</p>
        <p className="text-sm text-[var(--color-muted)] mb-6">
          Je antwoorden zijn waarschijnlijk opgeslagen.
        </p>

        <div className="flex flex-col sm:flex-row gap-2.5">
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 bg-[var(--ff-color-primary-700)] text-white rounded-xl text-sm font-bold hover:bg-[var(--ff-color-primary-600)] transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Probeer opnieuw
            </button>
          )}
          {!onRetry && (
            <button
              onClick={() => window.location.reload()}
              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 bg-[var(--ff-color-primary-700)] text-white rounded-xl text-sm font-bold hover:bg-[var(--ff-color-primary-600)] transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Vernieuw
            </button>
          )}
          {showBack && (
            <button
              onClick={() => window.history.back()}
              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 border border-[var(--color-border)] text-[var(--color-text)] rounded-xl text-sm font-semibold hover:border-[var(--ff-color-primary-400)] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Terug
            </button>
          )}
        </div>

        {!compact && (
          <div className="mt-2.5 flex flex-col sm:flex-row gap-2.5">
            <a
              href="/"
              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 border border-[var(--color-border)] text-[var(--color-text)] rounded-xl text-sm font-semibold hover:border-[var(--ff-color-primary-400)] transition-colors"
            >
              <Home className="w-4 h-4" />
              Naar start
            </a>
            <a
              href="/contact"
              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 border border-[var(--color-border)] text-[var(--color-muted)] rounded-xl text-sm font-semibold hover:border-[var(--ff-color-primary-400)] hover:text-[var(--color-text)] transition-colors"
            >
              <Mail className="w-4 h-4" />
              Contact opnemen
            </a>
          </div>
        )}

        <p className="mt-5 text-xs text-[var(--color-muted)]">
          Probeer het later nog eens als het probleem aanhoudt.
        </p>
      </div>
    </div>
  );
}
