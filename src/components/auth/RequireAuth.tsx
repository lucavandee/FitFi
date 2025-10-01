// /src/components/auth/RequireAuth.tsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";

/**
 * Lichte route-guard op basis van localStorage demo-auth.
 * Providers blijven onaangeroerd; geen SSR nodig.
 */
export default function RequireAuth({ children }: { children: React.ReactElement }) {
  const loc = useLocation();
  let authed = false;
  try {
    authed = window.localStorage.getItem("ff_auth") === "1";
  } catch {
    authed = false;
  }
  if (!authed) {
    return <Navigate to="/inloggen" replace state={{ from: loc.pathname + loc.search }} />;
  }
  return children;
}