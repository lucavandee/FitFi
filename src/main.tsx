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
import AuthProvider from "@/context/AuthContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HelmetProvider>
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