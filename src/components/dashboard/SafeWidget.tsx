import React from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';

interface SafeWidgetProps {
  name: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Safe widget wrapper with error boundary and analytics
 * Prevents dashboard crashes from individual widget failures
 */
const SafeWidget: React.FC<SafeWidgetProps> = ({ name, children, className = '' }) => {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Track widget errors in analytics
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'widget_error', {
        event_category: 'error',
        event_label: name,
        widget_name: name,
        error_message: error.message,
        error_stack: error.stack?.substring(0, 500), // Truncate for analytics
        component_stack: errorInfo.componentStack?.substring(0, 500)
      });
    }
    
    console.error(`[SafeWidget] ${name} widget error:`, error, errorInfo);
  };

  const fallback = (
    <div className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-200 ${className}`}>
      <div className="text-center py-4">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">⚠️</span>
        </div>
        <h3 className="font-medium text-gray-900 mb-2">Widget niet beschikbaar</h3>
        <p className="text-sm text-gray-600">Kon {name} niet laden.</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-3 text-sm text-[#89CFF0] hover:text-[#89CFF0]/80 font-medium"
        >
          Probeer opnieuw
        </button>
      </div>
    </div>
  );

  return (
    <ErrorBoundary
      onError={handleError}
      fallback={fallback}
    >
      {children}
    </ErrorBoundary>
  );
};

export default SafeWidget;