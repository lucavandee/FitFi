import { useNavigate, useLocation } from "react-router-dom";
import { useCallback } from "react";

/**
 * Navigation hook voor consistente routing
 */
export function useNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const goTo = useCallback((path: string, options?: { replace?: boolean }) => {
    navigate(path, options);
  }, [navigate]);

  const goBack = useCallback(() => {
    window.history.length > 1 ? navigate(-1) : navigate('/');
  }, [navigate]);

  const goHome = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const goToDashboard = useCallback(() => {
    navigate('/dashboard');
  }, [navigate]);

  const goToOnboarding = useCallback(() => {
    navigate('/onboarding');
  }, [navigate]);

  const goToResults = useCallback(() => {
    navigate('/results');
  }, [navigate]);

  const isCurrentPath = useCallback((path: string) => {
    return location.pathname === path;
  }, [location.pathname]);

  const isPathActive = useCallback((path: string) => {
    return location.pathname.startsWith(path);
  }, [location.pathname]);

  return {
    goTo,
    goBack,
    goHome,
    goToDashboard,
    goToOnboarding,
    goToResults,
    isCurrentPath,
    isPathActive,
    currentPath: location.pathname,
    location
  };
}

export default useNav;