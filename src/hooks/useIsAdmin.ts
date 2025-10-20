import { useUser } from "@/context/UserContext";

/**
 * Hook to check if current user has admin privileges
 * Uses database-backed is_admin column from profiles table
 * Admin status is automatically granted to @fitfi.ai email addresses
 */
export function useIsAdmin() {
  const { user } = useUser();

  // Check is_admin from database (set by trigger for @fitfi.ai emails)
  const isAdmin = !!user?.isAdmin;

  return { isAdmin, user };
}