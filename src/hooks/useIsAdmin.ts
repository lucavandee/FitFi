import { useUser } from "@/context/UserContext";

/**
 * Hook to check if current user has admin privileges
 * TODO: Replace with proper role-based access control
 */
export function useIsAdmin() {
  const { user } = useUser();

  // TODO: Replace with proper role check from user profile
  // For now: whitelist specific IDs or email domains
  const isAdmin =
    !!user &&
    (user.email?.endsWith("@fitfi.ai") ||
      user.id === "admin-seed" ||
      user.email?.includes("admin") ||
      // Development: allow any authenticated user for testing
      (import.meta.env.DEV && !!user.id));

  return { isAdmin };
}
