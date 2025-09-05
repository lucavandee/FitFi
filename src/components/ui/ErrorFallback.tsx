import { RefreshCw } from "lucide-react";

type Props = {
  error: Error;
  resetErrorBoundary: () => void;
  showDetails?: boolean;
};

function ErrorFallback({ error, resetErrorBoundary, showDetails }: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="max-w-md w-full mx-4 p-8 bg-white rounded-2xl shadow-lg text-center">
        <div className="w-16 h-16 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
          <RefreshCw className="w-8 h-8 text-red-600" />
        </div>
        
        <h1 className="text-2xl font-heading font-semibold mb-4 text-midnight">
          Er ging iets mis
        </h1>
        
        <p className="text-gray-600 mb-6">
          We hebben een onverwachte fout ondervonden. Probeer de pagina te vernieuwen.
        </p>
        
        <button
          onClick={resetErrorBoundary}
          className="btn-primary w-full mb-4"
        >
          Probeer opnieuw
        </button>
        
        <button
          onClick={() => window.location.href = '/'}
          className="btn-secondary w-full"
        >
          Naar homepage
        </button>
        
        {showDetails && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 mb-2">
              Technische details
            </summary>
            <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}

export default ErrorFallback;