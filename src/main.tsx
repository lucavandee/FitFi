import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import ErrorBoundary from "@/components/ErrorBoundary";
// CrashGate (systeem pad, niet ui/)
import CrashGate from "@/components/system/CrashGate";
// HelmetProvider
import { HelmetProvider } from "react-helmet-async";
import AuthProvider from "@/providers/AuthProvider";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <ErrorBoundary>
        <CrashGate>
          <AuthProvider>
            <App />
          </AuthProvider>
        </CrashGate>
      </ErrorBoundary>
    </HelmetProvider>
  </React.StrictMode>
);