/// <reference types="vite/client" />
declare global {
  interface Window {
    loadNovaAgent?: () => Promise<any>;
  }
}

import React, { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

if (!window.loadNovaAgent) {
  window.loadNovaAgent = async () => {
    try {
      const mod = await import("./ai/nova/agent"); // re-export naar services/ai/agent
      return (mod as any).default ?? (mod as any).agent ?? mod;
    } catch {
      const loader = await import("@/services/ai/agentLoader");
      return loader.loadNovaAgent();
    }
  };
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);