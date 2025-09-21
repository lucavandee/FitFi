import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// BELANGRIJK: globale styles (Tailwind + tokens + polish)
import "@/styles/index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);