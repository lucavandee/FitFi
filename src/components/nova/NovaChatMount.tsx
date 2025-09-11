import React from "react";
import { useLocation } from "react-router-dom";
import NovaLauncher from "./NovaLauncher";
import { NovaChatProvider } from "./NovaChatProvider";

// Pages waar Nova FAB niet moet verschijnen
const EXCLUDED_PATHS = ["/login", "/register", "/forgot-password", "/reset-password"];

export default function NovaChatMount() {
  const location = useLocation();
  
  if (EXCLUDED_PATHS.includes(location.pathname)) {
    return null;
  }

  return (
    <NovaChatProvider>
      <NovaLauncher />
    </NovaChatProvider>
  );
}