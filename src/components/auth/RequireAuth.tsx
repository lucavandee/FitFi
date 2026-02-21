import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useUser } from "@/context/UserContext";

export default function RequireAuth({ children }: { children: React.ReactElement }) {
  const loc = useLocation();
  const { user, status } = useUser();

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-[var(--color-border)] border-t-[var(--ff-color-primary-600)]" aria-hidden="true" />
          <p className="mt-3 text-sm text-[var(--color-muted)]">Laden...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated' || !user) {
    return <Navigate to="/inloggen" replace state={{ from: loc.pathname + loc.search }} />;
  }

  return children;
}
