import React from 'react';

interface CrashGateProps {
  children: React.ReactNode;
}

interface CrashGateState {
  error: Error | null;
}

interface CrashOverlayProps {
  error: Error;
  onRetry: () => void;
}

const CrashOverlay: React.FC<CrashOverlayProps> = ({ error, onRetry }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
      <div className="mb-4">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Oops! Er ging iets mis</h1>
        <p className="text-gray-600 mb-4">
          We hebben een onverwachte fout ondervonden. Probeer het opnieuw of neem contact met ons op als het probleem aanhoudt.
        </p>
        {error && (
          <details className="text-left mb-4">
            <summary className="text-sm text-gray-500 cursor-pointer">Technische details</summary>
            <pre className="text-xs text-gray-400 mt-2 p-2 bg-gray-50 rounded overflow-auto">
              {error.message}
            </pre>
          </details>
        )}
      </div>
      <button
        onClick={onRetry}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
      >
        Probeer opnieuw
      </button>
    </div>
  </div>
);

class ErrorBoundary extends React.Component<CrashGateProps, CrashGateState> {
  constructor(props: CrashGateProps) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): CrashGateState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('CrashGate caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.error) {
      return (
        <CrashOverlay 
          error={this.state.error} 
          onRetry={() => this.setState({ error: null })} 
        />
      );
    }

    return this.props.children;
  }
}

// Runtime error detection
let runtimeError: Error | null = null;

const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  const message = args.join(' ');
  if (message.includes('Error:') || message.includes('TypeError:') || message.includes('ReferenceError:')) {
    runtimeError = new Error(message);
  }
  originalConsoleError.apply(console, args);
};

window.addEventListener('error', (event) => {
  runtimeError = event.error || new Error(event.message);
});

window.addEventListener('unhandledrejection', (event) => {
  runtimeError = new Error(`Unhandled promise rejection: ${event.reason}`);
});

export default function CrashGate({ children }: CrashGateProps) {
  if (runtimeError) return <CrashOverlay error={runtimeError} onRetry={() => { runtimeError = null; window.location.reload(); }} />;
  
  return <ErrorBoundary>{children}</ErrorBoundary>;
}