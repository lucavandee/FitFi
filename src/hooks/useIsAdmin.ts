import { useUser } from "@/context/UserContext";

/**
 * Hook to check if current user has admin privileges
 * Uses database-backed is_admin column from profiles table
 * Beheerdersrecht staat in profiles.is_admin en wordt met de hand gezet. Een @fitfi.ai-adres geeft
 * sinds 16 okt 2026 geen rechten meer.
 */
export function useIsAdmin() {
  const { user, status } = useUser();

  // Check is_admin from database
  const isAdmin = !!user?.isAdmin;
  const isLoading = status === 'loading';

  return { isAdmin, user, isLoading };
}