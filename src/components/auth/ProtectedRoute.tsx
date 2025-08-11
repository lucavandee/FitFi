import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '@/context/UserContext';

type Props = {
  children: React.ReactNode;
  redirectTo?: string;
  allowedRoles?: string[];
};

export function ProtectedRoute({ children, redirectTo = '/inloggen', allowedRoles }: Props) {
  const { user, status } = useUser();
  const location = useLocation();
  const returnTo = `${location.pathname}${location.search}`;

  if (status === 'loading') {
    return <div className="p-6 text-sm text-gray-600">Even geduld…</div>;
  }

  if (status === 'unauthenticated' || !user) {
    return <Navigate to={`${redirectTo}?returnTo=${encodeURIComponent(returnTo)}`} replace state={{ from: location }} />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role ?? '')) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;