// /src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
// ❌ Geen BrowserRouter hier (App bevat al een Router)
import { HelmetProvider } from "react-helmet-async";

import App from "./App";
import { NovaChatProvider } from "@/components/nova/NovaChatProvider";
import NovaChatMount from "@/components/nova/NovaChatMount";

import "./index.css";
import "./components/nova/boot.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HelmetProvider>
      <NovaChatProvider>
        <App />
        {/* Floating FAB + overlay panel (rechtsonder) */}
        <NovaChatMount />
      </NovaChatProvider>
    </HelmetProvider>
  </React.StrictMode>
);