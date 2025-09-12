// /src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

import App from "./App";
// ⬇️ Named import omdat NovaChatProvider geen default export heeft
import { NovaChatProvider } from "@/components/nova/NovaChatProvider";
import NovaChatMount from "@/components/nova/NovaChatMount";

import "./index.css";
import "./components/nova/boot.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <NovaChatProvider>
          <App />
          {/* Floating FAB + overlay panel (rechtsonder) */}
          <NovaChatMount />
        </NovaChatProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);