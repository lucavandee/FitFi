declare global {
  interface Window { loadNovaAgent?: () => Promise<any>; }
}
import "../../src/index.css";

if (!window.loadNovaAgent) {
  window.loadNovaAgent = async () => {
    const { loadNovaAgent } = await import("@/services/ai/agentLoader");
    return loadNovaAgent();
  };
}

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// --- Nova agent loader polyfill --------------------------------------------
declare global {
  interface Window {
    loadNovaAgent?: () => Promise<any>;
  }
}
if (!window.loadNovaAgent) {
  window.loadNovaAgent = async () => {
    try {
      const mod: any = await import('./ai/nova/agent');
      return mod.default ?? mod.agent ?? mod;
    } catch {
      try {
        const mod: any = await import('./services/ai/novaService');
        return mod.default ?? mod.agent ?? mod;
      } catch {
        throw new ReferenceError('Nova agent module kon niet worden geladen');
      }
    }
  };
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)