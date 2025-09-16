import React, { useEffect } from "react";
import { w as track } from "@/utils/analytics";

/**
 * Global event handlers en error boundaries.
 * Unhandled errors, performance monitoring, etc.
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
        colno: event.colno,
      });
    };

    // Promise rejection handler
    const handleRejection = (event: PromiseRejectionEvent) => {
      console.error("Unhandled promise rejection:", event.reason);
      track("error:promise_rejection", {
        reason: String(event.reason),
      });
    };

    // Visibility change tracking
    const handleVisibilityChange = () => {
      track("app:visibility_change", {
        hidden: document.hidden,
        timestamp: Date.now(),
      });
    };

    // Performance observer voor Core Web Vitals
    const observePerformance = () => {
      if ("PerformanceObserver" in window) {
        try {
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (entry.entryType === "navigation") {
                const navEntry = entry as PerformanceNavigationTiming;
                track("perf:navigation", {
                  loadTime: navEntry.loadEventEnd - navEntry.loadEventStart,
                  domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
                  firstPaint: navEntry.loadEventEnd - navEntry.fetchStart,
                });
              }
            }
          });
          observer.observe({ entryTypes: ["navigation"] });
        } catch (e) {
          // PerformanceObserver not supported
        }
      }
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    observePerformance();

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return null;
};

export default GlobalHandlers;