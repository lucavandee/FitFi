// /src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

import App from "./App";
import getQueryClient from "@/system/queryClient";
import "./index.css";
import "@/styles/polish.addon.css"; // ← opt-in premium polish

const queryClient = getQueryClient();
import "./index.css"; // Tailwind + tokens + polish
import "./index.css"; // Tailwind + tokens + polish

const queryClient = getQueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <App />
          <Toaster position="top-center" />
        </QueryClientProvider>
          <App />
          {/* Globale toast-host (éénmalig) */}
          <Toaster position="top-center" />
        </QueryClientProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);