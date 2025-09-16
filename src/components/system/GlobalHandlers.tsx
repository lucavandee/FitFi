import React, { useEffect } from "react";
import { w as track } from "@/utils/analytics";

/**
 * Global error handling, performance monitoring en visibility tracking
 */
const GlobalHandlers: React.FC = () => {
  useEffect(() => {
    // Global error handler
    const handleError = (event: ErrorEvent) => {
      console.error("Global error:", event.error);
      track("error:global", {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    };

    // Unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error("Unhandled promise rejection:", event.reason);
      track("error:promise_rejection", {
        reason: String(event.reason)
      });
    };

    // Visibility change tracking
    const handleVisibilityChange = () => {
      track("app:visibility_change", {
        visible: !document.hidden,
        timestamp: Date.now()
      });
    };

    // Performance observer voor Core Web Vitals
    const observePerformance = () => {
      if ('PerformanceObserver' in window) {
        try {
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (entry.entryType === 'navigation') {
                const navEntry = entry as PerformanceNavigationTiming;
                track("perf:navigation", {
                  loadTime: navEntry.loadEventEnd - navEntry.loadEventStart,
                  domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
                  firstPaint: navEntry.loadEventEnd - navEntry.fetchStart
                });
              }
            }
          });
          observer.observe({ entryTypes: ['navigation'] });
        } catch (e) {
          // Performance Observer niet ondersteund
        }
      }
    };

    // Event listeners toevoegen
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Performance monitoring starten
    observePerformance();

    // Cleanup
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return null;
};

export default GlobalHandlers;