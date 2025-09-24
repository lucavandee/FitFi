import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

import { UserProvider } from "@/context/UserContext"; // ⬅️ BELANGRIJK: context-provider toevoegen
import App from "./App";

import "./index.css";               // tokens + Tailwind
import "@/styles/polish.addon.css"; // opt-in premium polish (laatste)

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          {/* Zorg dat ALLES wat useUser gebruikt, binnen deze provider valt */}
          <UserProvider>
            <App />
            <Toaster position="top-center" />
          </UserProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);