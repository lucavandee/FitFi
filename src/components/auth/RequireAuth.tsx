// /src/components/auth/RequireAuth.tsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useUser } from "@/context/UserContext";

/**
 * Route-guard die checkt of de user echt is ingelogd via Supabase.
 * Gebruikt UserContext die de live Supabase sessie bijhoudt.
 */
export default function RequireAuth({ children }: { children: React.ReactElement }) {
  const loc = useLocation();
  const { user, status } = useUser();

  // Show loading state while checking auth
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2 text-sm text-gray-600">Laden...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (status === 'unauthenticated' || !user) {
    console.log('🚫 [RequireAuth] Not authenticated, redirecting to login');
    return <Navigate to="/inloggen" replace state={{ from: loc.pathname + loc.search }} />;
  }

  // User is authenticated
  return children;
}