import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Provide global loader for Nova agent with safe fallbacks
declare global {
  interface Window {
    loadNovaAgent?: () => Promise<any>;
  }
}

if (!window.loadNovaAgent) {
  window.loadNovaAgent = async () => {
    try {
      const mod = await import("./ai/nova/agent");
      return (mod as any).default ?? (mod as any).agent ?? mod;
    } catch {
      const loader = await import("./services/ai/agentLoader");
      return loader.loadNovaAgent();
    }
  };
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);