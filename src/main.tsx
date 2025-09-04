import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
// CrashGate (systeem pad, niet ui/)
import CrashGate from "@/components/system/CrashGate";
// HelmetProvider
import { HelmetProvider } from "react-helmet-async";
        <CrashGate>
          <App />
        </CrashGate>
      </ErrorBoundary>
    </HelmetProvider>
  </React.StrictMode>
);