// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import { HelmetProvider } from "react-helmet-async";
import NovaChatProvider from "@/components/nova/NovaChatProvider";
import NovaChatMount from "@/components/nova/NovaChatMount";
import './components/nova/boot.tsx'

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HelmetProvider>
      <NovaChatProvider>
        {/* Globale, consistente centrering */}
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