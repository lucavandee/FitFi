import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

import App from "./App";
import getQueryClient from "@/system/queryClient";
import ErrorBoundary from "@/components/ErrorBoundary";
import "./index.css";               // Tailwind + tokens
import "@/styles/polish.addon.css"; // opt-in polish
import "@/styles/button-interactions.css"; // button micro-interactions

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
import { registerServiceWorker } from "@/utils/serviceWorker";

// Analytics
import { initAnalytics, track as analyticsTrack } from "@/utils/analytics";
import { setTelemetrySink } from "@/utils/telemetry";

initAnalytics();
setTelemetrySink(analyticsTrack);

// Initialize optimizations (production only)
if (typeof window !== 'undefined' && import.meta.env.PROD) {
  try {
    registerServiceWorker();
  } catch (error) {
    // Silently fail - PWA features are optional
  }
}

// Gedeelde client met defensieve defaults (retry: 1, geen refetch-on-focus)
// in plaats van een kale `new QueryClient()` (retry: 3 default). Drie van
// tien koude anonieme RPC-aanroepen (get_kandidaten via PostgREST) gaven een
// timeout; vier pogingen van 4-8s elk gaf zo een spinner van circa 35
// seconden voordat de eerlijke foutpagina verscheen (fixronde 1, punt 6).
const queryClient = getQueryClient();

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