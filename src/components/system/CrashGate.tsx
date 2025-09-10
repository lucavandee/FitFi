import React from "react";
import ErrorBoundary from "@/components/ErrorBoundary";

type Props = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

/**
 * Top-level crash gate voor de hele app
 * Voorkomt white screen of death
 */
export default function CrashGate({ children, fallback }: Props) {
  return (
    <ErrorBoundary
      fallback={
        fallback || (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center p-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Er ging iets mis
              </h1>
              <p className="text-gray-600 mb-6">
                We hebben een onverwachte fout gedetecteerd. Probeer de pagina te verversen.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Pagina verversen
              </button>
            </div>
          </div>
        )
      }
    >
      {children}
    </ErrorBoundary>
  );
}