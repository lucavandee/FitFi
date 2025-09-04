import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Eigen ErrorBoundary
import ErrorBoundary from "@/components/ErrorBoundary";
// CrashGate (systeem pad, niet ui/)
import CrashGate from "@/components/system/CrashGate";
// HelmetProvider
import { HelmetProvider } from "react-helmet-async";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HelmetProvider>
      <ErrorBoundary>
        <CrashGate>
          <App />
        </CrashGate>
      </ErrorBoundary>
    </HelmetProvider>
  </React.StrictMode>
);