import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

import App from "./App";
import AnalyticsLoader from "@/components/analytics/AnalyticsLoader";
import ErrorBoundary from "@/components/ErrorBoundary";
import "./index.css";               // Tailwind + tokens
import "@/styles/polish.addon.css"; // opt-in polish

// Early boot log
console.log('🚀 [FitFi] App starting...', {
  env: import.meta.env.MODE,
  supabase: import.meta.env.VITE_USE_SUPABASE,
  timestamp: new Date().toISOString()
});

// Make migration utility available in console
import "@/utils/migrateQuizToDatabase";

// Context providers
import { ThemeProvider } from "@/context/ThemeContext";
import { UserProvider } from "@/context/UserContext";
import { GamificationProvider } from "@/context/GamificationContext";
import { OnboardingProvider } from "@/context/OnboardingContext";

// Performance & PWA
import { registerServiceWorker } from "@/utils/serviceWorker.ts";

// Initialize optimizations (production only)
if (typeof window !== 'undefined' && import.meta.env.PROD) {
  try {
    registerServiceWorker();
  } catch (error) {
    // Silently fail - PWA features are optional
  }
}

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <HelmetProvider>
        <BrowserRouter>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider>
              <UserProvider>
                <GamificationProvider>
                  <OnboardingProvider>
                    <App />
                    <AnalyticsLoader />
                    <Toaster position="top-center" />
                  </OnboardingProvider>
                </GamificationProvider>
              </UserProvider>
            </ThemeProvider>
          </QueryClientProvider>
        </BrowserRouter>
      </HelmetProvider>
    </ErrorBoundary>
  </React.StrictMode>
);