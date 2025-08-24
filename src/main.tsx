import "@/bootstrap/guards";
import { HelmetProvider } from "react-helmet-async";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// --- Nova agent loader polyfill --------------------------------------------
// Sommige builds refereren naar `loadNovaAgent()` (globale func). Definieer 'm hier
// zodat NovaChat altijd kan initialiseren, ook als imports refactoren.
declare global {
  interface Window {
    loadNovaAgent?: () => Promise<any>;
  }
}
if (!window.loadNovaAgent) {
  window.loadNovaAgent = async () => {
    // Probeer standaard pad
    try {
      const mod: any = await import('./agent');
      return mod.default ?? mod.agent ?? mod;
    } catch {
      // Fallbacks voor alternatieve locaties (no-op als niet bestaan)
      try {
        const mod: any = await import('./services/ai/agent');
        return mod.default ?? mod.agent ?? mod;
      } catch {
        // Laat de caller een nette fout zien (NovaChat heeft al fallback UI)
        throw new ReferenceError('Nova agent module kon niet worden geladen');
      }
    }
  };
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>,
);
