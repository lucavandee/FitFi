import React from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx';
import { configureRouterFutureFlags } from './utils/routerUtils';
import { initializeSentry } from './utils/sentryConfig';
import { initializeAnalytics } from './utils/analytics';
import './styles/main.css';
import { setupAutoSave } from './utils/progressPersistence';

// Configure React Router future flags to suppress warnings
configureRouterFutureFlags();

// Initialize Sentry
initializeSentry();

// Initialize Google Analytics
initializeAnalytics();

// Setup auto-save for progress persistence
setupAutoSave();

// Register service worker with error handling
if ('serviceWorker' in navigator && import.meta.env.PROD && 
    !window.location.hostname.includes('webcontainer.io') && 
    !window.location.hostname.includes('stackblitz.io')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/serviceWorker.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.error('SW registration failed: ', registrationError);
      });
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
