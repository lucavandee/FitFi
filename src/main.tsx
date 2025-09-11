// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Nova (provider + floating mount)
import NovaChatProvider from "@/components/nova/NovaChatProvider";
import NovaChatMount from "@/components/nova/NovaChatMount";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <NovaChatProvider>
      {/* Global centering wrapper — uniform op alle routes */}
      <div className="min-h-screen bg-[#F6F6F6]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <App />
        </div>
      </div>

      {/* Floating FAB + Panel (rechtsonder, overlay) */}
      <NovaChatMount />
    </NovaChatProvider>
  </React.StrictMode>
);