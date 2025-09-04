import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import App from "./App";
import "./index.css";
import AuthProvider from "@/context/AuthContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import CrashGate from "@/components/system/CrashGate";

const root = createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <HelmetProvider>
      <ErrorBoundary>
        <CrashGate>
          <AuthProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </AuthProvider>
        </CrashGate>
      </ErrorBoundary>
    </HelmetProvider>
  </React.StrictMode>
);