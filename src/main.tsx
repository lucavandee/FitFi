import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import ThemeProvider from "@/context/ThemeContext";
import UserProvider from "@/context/UserContext";
import GamificationProvider from "@/context/GamificationContext";
import OnboardingProvider from "@/context/OnboardingContext";
import NovaChatProvider from "@/components/nova/NovaChatProvider";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);