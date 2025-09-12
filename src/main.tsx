// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import NovaChatProvider from "@/components/nova/NovaChatProvider";
import NovaBoot from "@/components/nova/boot";
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
        <UserProvider>
          <OnboardingProvider>
            <App />
            <NovaBoot />
          </OnboardingProvider>
        </UserProvider>
      </NovaChatProvider>
          </div>
        </div>

        {/* Floating FAB + overlay panel (rechtsonder) */}
        <NovaChatMount />
      </NovaChatProvider>
    </HelmetProvider>
  </React.StrictMode>
);