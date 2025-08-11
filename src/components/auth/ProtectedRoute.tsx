import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import FullPageSpinner from '@/components/ui/FullPageSpinner';

type Props = {
  children: React.ReactNode;
  redirectTo?: string;
  allowedRoles?: string[];
};

const ProtectedRoute: React.FC<Props> = ({ children, redirectTo = '/login', allowedRoles }) => {
  const { status, user } = useUser();
  const location = useLocation();

  if (status === 'loading') {
    return <FullPageSpinner label="Authenticatie controleren…" delayMs={250} />;
  }
  if (status === 'unauthenticated') {
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }
  if (allowedRoles && !allowedRoles.includes(user?.role ?? '')) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

export default ProtectedRoute;