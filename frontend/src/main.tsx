import React from "react";
import ReactDOM from "react-dom/client";
import App from "@/App";
import "@/index.css";

// Zorg dat de globale loader bestaat (crash-preventie voor Nova)
declare global {
  interface Window { loadNovaAgent?: () => Promise<any>; }
}
if (!window.loadNovaAgent) {
  window.loadNovaAgent = async () => {
    try {
      const mod = await import("@/services/ai/agentLoader");
      return (mod as any).default ?? (mod as any).agent ?? mod;
    } catch {
      return { stub: true };
    }
  };
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);