import React, { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useUser } from "@/context/UserContext";

const MAX_LOADING_MS = 5000;

export default function RequireAuth({ children }: { children: React.ReactElement }) {
  const loc = useLocation();
  const { user, status } = useUser();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (status !== 'loading') return;
    const timer = setTimeout(() => setTimedOut(true), MAX_LOADING_MS);
    return () => clearTimeout(timer);
  }, [status]);

  if (status === 'loading' && !timedOut) {
    return (
      <div className="flex items-center justify-center bg-[var(--color-bg)]" style={{ minHeight: 'calc(100vh - 64px)' }}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-[var(--color-border)] border-t-[var(--ff-color-primary-600)]" aria-hidden="true" />
          <p className="mt-3 text-sm text-[var(--color-muted)]">Laden...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated' || !user) {
    const returnPath = loc.pathname + loc.search;
    return <Navigate to="/inloggen" replace state={{ from: returnPath }} />;
  }

  return children;
}
