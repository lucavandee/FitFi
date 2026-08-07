import React from 'react';

interface SafeWidgetProps {
  name: string;
  children: React.ReactNode;
  className?: string;
}

interface WidgetErrorBoundaryProps {
  name: string;
  className: string;
  children: React.ReactNode;
}

interface WidgetErrorBoundaryState {
  hasError: boolean;
}

/**
 * Lichte, widget-scoped error boundary (los van de globale @/components/ErrorBoundary,
 * die geen custom fallback/onError ondersteunt en een full-page fallback rendert).
 */
class WidgetErrorBoundary extends React.Component<WidgetErrorBoundaryProps, WidgetErrorBoundaryState> {
  state: WidgetErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): WidgetErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Track widget errors in analytics
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'widget_error', {
        event_category: 'error',
        event_label: this.props.name,
        widget_name: this.props.name,
        error_message: error.message,
        error_stack: error.stack?.substring(0, 500), // Truncate for analytics
        component_stack: errorInfo.componentStack?.substring(0, 500)
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-200 ${this.props.className}`}>
          <div className="text-center py-4">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="font-medium text-gray-900 mb-2">Widget niet beschikbaar</h3>
            <p className="text-sm text-gray-600">Kon {this.props.name} niet laden.</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 text-sm text-[#A85740] hover:text-[#A85740]/80 font-medium"
            >
              Probeer opnieuw
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * Safe widget wrapper with error boundary and analytics
 * Prevents dashboard crashes from individual widget failures
 */
const SafeWidget: React.FC<SafeWidgetProps> = ({ name, children, className = '' }) => {
  return (
    <WidgetErrorBoundary name={name} className={className}>
      {children}
    </WidgetErrorBoundary>
  );
};

export default SafeWidget;