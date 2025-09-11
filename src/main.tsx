// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Helmet provider (vereist voor react-helmet-async <Helmet /> usage)
import { HelmetProvider } from "react-helmet-async";

// Nova (provider + floating mount)
import NovaChatProvider from "@/components/nova/NovaChatProvider";
import NovaChatMount from "@/components/nova/NovaChatMount";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HelmetProvider>
      <NovaChatProvider>
        {/* Globale, consistente centrering voor alle routes */}
        <div className="min-h-screen bg-[#F6F6F6]">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
            <App />
          </div>
        </div>

        {/* Floating FAB + overlay panel (rechtsonder) */}
        <NovaChatMount />
      </NovaChatProvider>
    </HelmetProvider>
  </React.StrictMode>
);