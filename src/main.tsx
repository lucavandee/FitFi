import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Gebruik onze eigen ErrorBoundary component
import ErrorBoundary from "@/components/ErrorBoundary";
// Één CrashGate
import CrashGate from "@/components/system/CrashGate";
// Één HelmetProvider
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