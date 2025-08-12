import React from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from '@/App.tsx';
import { configureRouterFutureFlags } from '@/utils/routerUtils';
import { initializeSentry } from '@/utils/sentryConfig';
import { advancedAnalytics } from '@/services/AdvancedAnalytics';
import { initializePerformanceOptimizations } from '@/utils/performanceUtils';
import { startHealthMonitoring } from '@/lib/supabaseHealth';
import '@/styles/main.css';

// Configure React Router future flags to suppress warnings
configureRouterFutureFlags();

// Initialize Sentry
initializeSentry();

// Initialize performance optimizations
initializePerformanceOptimizations();

// Initialize Supabase health monitoring
if (typeof window !== 'undefined') {
  // Start health monitoring after initial load
  window.addEventListener('load', () => {
    try {
      startHealthMonitoring(60000); // Check every minute
    } catch (error) {
      console.warn('Health monitoring initialization failed:', error);
    }
  });
}

// Initialize Advanced Analytics
if (typeof window !== 'undefined') {
  // Start advanced analytics tracking
  window.addEventListener('load', () => {
    try {
      // Initialize with user ID if available
      const userId = localStorage.getItem('supabase.auth.token') ? 'user' : undefined;
      // Advanced analytics is already initialized in the constructor
    } catch (error) {
      console.warn('Analytics initialization failed:', error);
    }
  });
  
  // Save analytics data before page unload
  window.addEventListener('beforeunload', () => {
    advancedAnalytics.stopTracking();
  });
}

// Global error handler for chunk loading failures
window.addEventListener('error', (event) => {
  if (event.message && event.message.includes('Loading chunk')) {
    console.error('Chunk loading failed:', event);
    // Optionally reload the page or show a user-friendly message
    if (confirm('Er is een probleem opgetreden bij het laden van de applicatie. Wilt u de pagina vernieuwen?')) {
      window.location.reload();
    }
  }
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  
  // Check if it's a chunk loading error
  if (event.reason && event.reason.message && event.reason.message.includes('Loading chunk')) {
    event.preventDefault();
    console.error('Chunk loading promise rejection handled');
  }
});

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>
);
