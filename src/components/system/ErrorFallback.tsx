import React, { useEffect, useRef } from "react";
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
  title = "Er ging iets mis.",
  description = "Vernieuw de pagina of probeer het opnieuw.",
  showBack = true,
  compact = false,
}: Props) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        "flex items-center justify-center bg-[#FAFAF8]",
        compact ? "py-12 px-4" : "min-h-[60vh] px-6"
      )}
    >
      <div className={cn("w-full text-center", compact ? "max-w-sm" : "max-w-md")}>
        <div className="w-12 h-12 rounded-full bg-[#FFFFFF] border border-[#E5E5E5] flex items-center justify-center mx-auto mb-5">
          <RefreshCw className="w-5 h-5 text-[#6E6E6E]" aria-hidden="true" />
        </div>

        <h2
          ref={headingRef}
          tabIndex={-1}
          className={cn(
            "font-bold text-[#1A1A1A] mb-2 outline-none",
            compact ? "text-lg" : "text-xl"
          )}
        >
          {title}
        </h2>
        <p className="text-sm text-[#6E6E6E] mb-1">{description}</p>
        <p className="text-sm text-[#6E6E6E] mb-6">
          We kunnen dit nu niet laden. Probeer later nog eens.
        </p>

        <div className="flex flex-col sm:flex-row gap-2.5">
          {onRetry ? (
            <button
              onClick={onRetry}
              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 bg-[#9A503B] text-white rounded-xl text-sm font-bold hover:bg-[#B55E45] transition-colors"
            >
              <RefreshCw className="w-4 h-4" aria-hidden="true" />
              Probeer opnieuw
            </button>
          ) : (
            <button
              onClick={() => window.location.reload()}
              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 bg-[#9A503B] text-white rounded-xl text-sm font-bold hover:bg-[#B55E45] transition-colors"
            >
              <RefreshCw className="w-4 h-4" aria-hidden="true" />
              Vernieuw
            </button>
          )}
          {showBack && (
            <button
              onClick={() => window.history.back()}
              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 border border-[#E5E5E5] text-[#1A1A1A] rounded-xl text-sm font-semibold hover:border-[#D4856E] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              Terug
            </button>
          )}
        </div>

        {!compact && (
          <div className="mt-2.5 flex flex-col sm:flex-row gap-2.5">
            <a
              href="/dashboard"
              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 border border-[#E5E5E5] text-[#1A1A1A] rounded-xl text-sm font-semibold hover:border-[#D4856E] transition-colors"
            >
              <Home className="w-4 h-4" aria-hidden="true" />
              Naar dashboard
            </a>
            <a
              href="/contact"
              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 border border-[#E5E5E5] text-[#6E6E6E] rounded-xl text-sm font-semibold hover:border-[#D4856E] hover:text-[#1A1A1A] transition-colors"
            >
              <Mail className="w-4 h-4" aria-hidden="true" />
              Contact
            </a>
          </div>
        )}

        <p className="mt-5 text-xs text-[#6E6E6E]">
          Probeer het later nog eens als het probleem aanhoudt.
        </p>
      </div>
    </div>
  );
}
