import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

import App from "./App";
import AnalyticsLoader from "@/components/analytics/AnalyticsLoader";
import "./index.css";               // Tailwind + tokens
import "@/styles/polish.addon.css"; // opt-in polish
import "@/styles/polish.addon.css"; // opt-in polish

// Context providers
import { ThemeProvider } from "@/context/ThemeContext";
import { UserProvider } from "@/context/UserContext";
import { GamificationProvider } from "@/context/GamificationContext";
import { OnboardingProvider } from "@/context/OnboardingContext";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
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
  </React.StrictMode>
);