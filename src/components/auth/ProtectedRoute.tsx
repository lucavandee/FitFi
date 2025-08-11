import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '@/context/UserContext';

type Props = {
  children: React.ReactNode;
  redirectTo?: string;
  allowedRoles?: string[];
};

export function ProtectedRoute({ children, redirectTo = '/login', allowedRoles }: Props) {
  const { user, status } = useUser();
  const location = useLocation();

  if (status === 'loading') {
    return <div className="min-h-[50vh] grid place-items-center text-sm opacity-70">Authenticatie controleren…</div>;
  }

  if (status === 'unauthenticated' || !user) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role ?? '')) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;