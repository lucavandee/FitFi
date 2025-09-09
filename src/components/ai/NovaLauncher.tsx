import { lazy, Suspense } from "react";
import ErrorBoundary from "@/components/ErrorBoundary";
// LET OP: exact dit pad — jouw error toonde dit bestand al.
import { NovaConnectionProvider } from "./NovaConnection";

// Lichtgewicht fallback; vervang evt. door je eigen Loading component
function InlineSpinner() {
  return (
    <div className="p-3 text-sm opacity-70" role="status" aria-live="polite">
      Nova laden…
    </div>
  );
}

/**
 * Belangrijk:
 * - Relatieve lazy import (géén /src/… en géén .tsx extensie)
 * - Dit voorkomt "Failed to fetch dynamically imported module … .tsx"
 */
const NovaChat = lazy(() => import("./NovaChat"));

type Props = Record<string, unknown>;

export default function NovaLauncher(props: Props) {
  return (
    <ErrorBoundary>
      <NovaConnectionProvider>
        <Suspense fallback={<InlineSpinner />}>
          {/* @ts-expect-error: NovaChat kan extra props accepteren */}
          <NovaChat {...props} />
        </Suspense>
      </NovaConnectionProvider>
    </ErrorBoundary>
  );
}