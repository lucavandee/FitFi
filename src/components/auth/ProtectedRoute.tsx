import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import LoadingFallback from '../ui/LoadingFallback';
import Button from '../ui/Button';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
  allowedRoles?: ('admin' | 'user')[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  redirectTo,
  allowedRoles
}) => {
  const { user, isLoading, authEventPending } = useUser();
  const location = useLocation();

  // Show loading while checking authentication
  if (isLoading || authEventPending) {
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

  // Check role-based access
  if (requireAuth && user && allowedRoles && !allowedRoles.includes(user.role || 'user')) {
    return (
      <div className="min-h-screen bg-[#FAF8F6] flex items-center justify-center">
        <div className="bg-white p-8 rounded-3xl shadow-sm text-center max-w-md">
          <h2 className="text-2xl font-light text-gray-900 mb-4">Toegang geweigerd</h2>
          <p className="text-gray-600 mb-6">Je hebt geen toegang tot deze pagina.</p>
          <Button as={Link} to="/dashboard" variant="primary" fullWidth>
            Terug naar dashboard
          </Button>
        </div>
      </div>
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
};
