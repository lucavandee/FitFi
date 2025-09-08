import React, { lazy, Suspense } from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';

// Lichtgewicht fallback spinner
function InlineSpinner() {
  return (
    <div className="p-4 text-sm opacity-70" role="status" aria-live="polite">
      Nova laden…
    </div>
  );
}

/**
 * Belangrijk:
 * - Relatieve import naar ./NovaChat (geen leading slash, geen .tsx-extensie)
 * - Dit laat Vite resolven en voorkomt fetch van rauwe .tsx via netwerk
 */
const NovaChat = lazy(() => import('./NovaChat'));

type Props = {
  // geef mee wat je normaal ook doorzet (session, user, etc.)
  [key: string]: unknown;
};

export default function NovaLauncher(props: Props) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<InlineSpinner />}>
        {/* @ts-expect-error - NovaChat kan extra props accepteren */}
        <NovaChat {...props} />
      </Suspense>
    </ErrorBoundary>
  );
}