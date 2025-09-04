import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import App from "./App";
import "./index.css";
import AuthProvider from "@/context/AuthContext";
import { GamificationProvider } from "@/context/GamificationContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import CrashGate from "@/components/ui/CrashGate";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HelmetProvider>
      <ErrorBoundary>
        <CrashGate>
          <AuthProvider>
            <GamificationProvider>
              <BrowserRouter>
                <App />
              </BrowserRouter>
            </GamificationProvider>
          </AuthProvider>
        </CrashGate>
      </ErrorBoundary>
    </HelmetProvider>
  </React.StrictMode>
);