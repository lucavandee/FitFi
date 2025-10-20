import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  children: ReactNode;
  onReset?: () => void;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorCount: number;
}

export class VisualPreferenceErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorCount: 0
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('[VisualPreferenceErrorBoundary] Caught error:', error, errorInfo);

    try {
      const telemetry = {
        timestamp: new Date().toISOString(),
        error: error.message,
        stack: error.stack,
        component: 'VisualPreferenceStep',
        errorInfo: errorInfo.componentStack
      };

      localStorage.setItem('fitfi_visual_preference_error', JSON.stringify(telemetry));
      console.warn('[Telemetry] Visual preference error logged:', telemetry);
    } catch (telemetryError) {
      console.error('[Telemetry] Failed to log error:', telemetryError);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorCount: this.state.errorCount + 1
    });

    this.props.onReset?.();

    try {
      localStorage.removeItem('fitfi_visual_preference_error');
    } catch (err) {
      console.error('Failed to clear error telemetry:', err);
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg mx-auto px-4 py-12"
        >
          <div className="text-center bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 mb-6"
            >
              <AlertTriangle className="w-8 h-8 text-orange-600" />
            </motion.div>

            <h2 className="text-2xl font-bold text-[var(--color-text)] mb-3">
              Oeps, er ging iets mis
            </h2>
            <p className="text-[var(--color-text-secondary)] mb-6 max-w-md mx-auto">
              We hadden een klein probleempje bij het laden van de stijlbeelden.
              Geen zorgen, we kunnen gewoon opnieuw proberen.
            </p>

            {this.state.errorCount > 2 && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  Het lijkt erop dat dit probleem blijft terugkomen. Je kunt doorgaan
                  zonder deze stap - je stijlprofiel wordt dan gebaseerd op je andere
                  antwoorden.
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[var(--ff-color-primary-700)] text-white rounded-[var(--radius-lg)] font-semibold hover:bg-[var(--ff-color-primary-600)] transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Opnieuw proberen
              </button>

              {this.state.errorCount > 2 && this.props.onReset && (
                <button
                  onClick={() => {
                    this.props.onReset?.();
                    this.handleReset();
                  }}
                  className="px-6 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] rounded-[var(--radius-lg)] font-semibold hover:bg-[var(--color-bg)] transition-colors"
                >
                  Stap overslaan
                </button>
              )}
            </div>

            {this.state.error && (
              <details className="mt-6 text-left">
                <summary className="text-xs text-[var(--color-text-secondary)] cursor-pointer hover:text-[var(--color-text)] transition-colors">
                  Technische details
                </summary>
                <pre className="mt-2 p-3 bg-[var(--color-bg)] rounded text-xs text-[var(--color-text-secondary)] overflow-auto max-h-32">
                  {this.state.error.message}
                </pre>
              </details>
            )}
          </div>
        </motion.div>
      );
    }

    return this.props.children;
  }
}
