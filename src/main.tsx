import React from "react";
import ReactDOM from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import GlobalErrorBoundary from "@/components/system/GlobalErrorBoundary";
import NovaChatMount from '@/components/nova/NovaChatMount'
import App from "@/App";
import NovaChatMount from "@/components/nova/NovaChatMount";

const BUILD_TAG = import.meta.env.VITE_BUILD_TAG ?? 'dev';
if (import.meta.env.PROD) {
  console.info(`✅ FitFi build=${BUILD_TAG} | NovaChat force-mounted at root (prod)`);
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HelmetProvider>
      <GlobalErrorBoundary>
        <App />
        <NovaChatMount />
        <NovaChatMount />
      </GlobalErrorBoundary>
    </HelmetProvider>
  </React.StrictMode>
);