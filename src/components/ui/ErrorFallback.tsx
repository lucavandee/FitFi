import React from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Button from "./Button";

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
  showDetails?: boolean;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
  showDetails = false,
}) => {
  const handleGoHome = () => {
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4">
      <div className="bg-accent text-text-dark p-6 rounded-2xl shadow-lg max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="text-red-600" size={32} />
        </div>

        <h1 className="text-2xl font-bold text-red-600 mb-4">
          Oeps! Er ging iets mis
        </h1>

        <p className="text-gray-600 mb-6">
          Er is een onverwachte fout opgetreden. Probeer de pagina te vernieuwen
          of ga terug naar de homepage.
        </p>

        {showDetails && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
            <h3 className="font-semibold text-sm mb-2">Technische details:</h3>
            <p className="text-xs text-gray-600 font-mono break-all">
              {error.message}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="primary"
            onClick={resetErrorBoundary}
            icon={<RefreshCw size={16} />}
            iconPosition="left"
            className="flex-1"
          >
            Probeer opnieuw
          </Button>

          <Button
            variant="secondary"
            onClick={handleGoHome}
            icon={<Home size={16} />}
            iconPosition="left"
            className="flex-1"
          >
            Naar homepage
          </Button>
        </div>

        <p className="text-xs text-gray-500 mt-4">
          Als het probleem aanhoudt, neem dan contact op met onze support.
        </p>
      </div>
    </div>
  );
};

export default ErrorFallback;
