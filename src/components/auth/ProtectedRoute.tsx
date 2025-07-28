import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import LoadingFallback from '../ui/LoadingFallback';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requireAuth = true,
  redirectTo
}: ProtectedRouteProps) {
  const { user, isLoading } = useUser();
  const location = useLocation();

  // Show loading while checking authentication
  if (isLoading) {
    return <LoadingFallback fullScreen message="Authenticatie controleren..." />;
  }

  // If authentication is required but user is not logged in
  if (requireAuth && !user) {
    return (
      <Navigate 
        to={redirectTo || '/inloggen'} 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // If user is logged in but shouldn't be (e.g., login page when already logged in)
  if (!requireAuth && user) {
    return (
      <Navigate 
        to={redirectTo || '/dashboard'} 
        replace 
      />
    );
  }

  return <>{children}</>;
}
