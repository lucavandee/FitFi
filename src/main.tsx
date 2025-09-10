import React from "react";
import ReactDOM from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import GlobalErrorBoundary from "@/components/system/GlobalErrorBoundary";
import App from "@/App";
import NovaChatProvider from "@/components/nova/NovaChatProvider";
import ChatLauncher from "@/components/nova/ChatLauncher";
import ChatPanel from "@/components/nova/ChatPanel";

if (import.meta.env.PROD) console.info("✅ FitFi: NovaChat root mounted (prod)");
import NovaChatMount from "@/components/nova/NovaChatMount";

if (import.meta.env.PROD) console.info("✅ FitFi: NovaChat root mounted (prod)");

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HelmetProvider>
      <GlobalErrorBoundary>
        <NovaChatProvider>
          <App />
          <ChatLauncher />
          <ChatPanel />
        </NovaChatProvider>
        <NovaChatMount />
      </GlobalErrorBoundary>
    </HelmetProvider>
  </React.StrictMode>
);