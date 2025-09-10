import React from "react";
import ReactDOM from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import GlobalErrorBoundary from "@/components/system/GlobalErrorBoundary";
import App from "@/App";
import NovaChatMount from "@/components/nova/NovaChatMount";

if (import.meta.env.PROD) {
  console.info("✅ FitFi: NovaChat root mounted (prod)");
}

const BUILD_TAG = import.meta.env.VITE_BUILD_TAG ?? 'dev';
if (import.meta.env.PROD) {
  console.info(`✅ FitFi build=${BUILD_TAG} | NovaChat root mounted (prod)`);
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HelmetProvider>
      <GlobalErrorBoundary>
        <App />
        <NovaChatMount />
      </GlobalErrorBoundary>
    </HelmetProvider>
  </React.StrictMode>
);