import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import ErrorBoundary from "@/components/ErrorBoundary";
import CrashGate from "@/components/system/CrashGate";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <CrashGate>
        <App />
      </CrashGate>
    </ErrorBoundary>
  </React.StrictMode>
);