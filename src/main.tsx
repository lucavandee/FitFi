// /src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

import App from "./App";
import getQueryClient from "@/system/queryClient";
import "@/styles/polish.addon.css"; // ← Alleen de opt-in .ff-* polish laden
import "./index.css"; // Tailwind + tokens + polish

const queryClient = getQueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <App />
          {/* Globale toast-host (éénmalig) */}
          <Toaster position="top-center" />
        </QueryClientProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);