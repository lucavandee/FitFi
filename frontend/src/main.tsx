import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Zorg dat de globale loader altijd bestaat (crash-preventie)
declare global {
  interface Window { loadNovaAgent?: () => Promise<any>; }
}
if (!window.loadNovaAgent) {
  window.loadNovaAgent = async () => {
    try {
      // Probeer lokale loader (relatief pad, werkt zonder @ alias)
      const mod = await import("./services/ai/agentLoader");
      return mod.default ?? (mod as any).agent ?? mod;
    } catch {
      // Fallback stub
      return { stub: true };
    }
  };
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);