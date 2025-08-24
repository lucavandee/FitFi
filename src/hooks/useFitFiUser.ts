import { useEffect, useState } from "react";
import type { FitFiUserProfile, DataResponse } from "@/services/data/types";
import { fetchUser } from "@/services/data/dataService";

interface UseFitFiUserOptions {
  enabled?: boolean;
  refetchOnMount?: boolean;
  cacheTime?: number;
}

interface UseFitFiUserResult {
  data: FitFiUserProfile | null;
  loading: boolean;
  error: string | null;
  source: "supabase" | "local" | "fallback";
  cached: boolean;
  refetch: () => Promise<void>;
  isStale: boolean;
}

export function useFitFiUser(
  userId?: string,
  options: UseFitFiUserOptions = {},
): UseFitFiUserResult {
  const {
    enabled = true,
    refetchOnMount = true,
    cacheTime = 5 * 60 * 1000, // 5 minutes
  } = options;

  const [data, setData] = useState<FitFiUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<"supabase" | "local" | "fallback">(
    "fallback",
  );
  const [cached, setCached] = useState(false);
  const [lastFetch, setLastFetch] = useState<number>(0);

  const fetchUserData = async () => {
    if (!enabled || !userId) {
      setLoading(false);
      return;
    }

    let alive = true;

    try {
      setLoading(true);
      setError(null);

      const response: DataResponse<FitFiUserProfile | null> =
        await fetchUser(userId);

      if (alive) {
        setData(response.data);
        setSource(response.source);
        setCached(response.cached);
        setLastFetch(Date.now());

        // Set warning if using fallback
        if (
          response.source === "fallback" &&
          response.errors &&
          response.errors.length > 0
        ) {
          setError("Live data niet beschikbaar, fallback gebruikt");
        }
      }
    } catch (err) {
      if (alive) {
        setError(err instanceof Error ? err.message : "Onbekende fout");
        setData(null);
        setSource("fallback");
        setCached(false);
      }
    } finally {
      if (alive) {
        setLoading(false);
      }
    }

    return () => {
      alive = false;
    };
  };

  useEffect(() => {
    if (refetchOnMount || !data) {
      const cleanup = fetchUserData();
      return () => cleanup.then((fn) => fn?.());
    }
  }, [userId, enabled, refetchOnMount]);

  // Check if data is stale
  const isStale = lastFetch > 0 && Date.now() - lastFetch > cacheTime;

  return {
    data,
    loading,
    error,
    source,
    cached,
    refetch: fetchUserData,
    isStale,
  };
}

/**
 * Hook for current authenticated user profile
 */
export function useCurrentUserProfile(): UseFitFiUserResult {
  // This would integrate with your existing UserContext
  // For now, return a placeholder implementation
  const [currentUserId, setCurrentUserId] = useState<string | undefined>();

  useEffect(() => {
    // Get current user ID from your auth context
    // This is a placeholder - integrate with your actual auth system
    const getCurrentUserId = () => {
      // Example: return user?.id from your UserContext
      return undefined;
    };

    setCurrentUserId(getCurrentUserId());
  }, []);

  return useFitFiUser(currentUserId, {
    enabled: !!currentUserId,
    refetchOnMount: true,
  });
}

/**
 * Hook for multiple users (batch loading)
 */
export function useMultipleFitFiUsers(userIds: string[]): {
  users: Record<string, FitFiUserProfile | null>;
  loading: boolean;
  errors: Record<string, string>;
  refetchAll: () => Promise<void>;
} {
  const [users, setUsers] = useState<Record<string, FitFiUserProfile | null>>(
    {},
  );
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchAllUsers = async () => {
    if (userIds.length === 0) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const newUsers: Record<string, FitFiUserProfile | null> = {};
    const newErrors: Record<string, string> = {};

    await Promise.all(
      userIds.map(async (userId) => {
        try {
          const response = await fetchUser(userId);
          newUsers[userId] = response.data;
        } catch (error) {
          newErrors[userId] =
            error instanceof Error ? error.message : "Onbekende fout";
          newUsers[userId] = null;
        }
      }),
    );

    setUsers(newUsers);
    setErrors(newErrors);
    setLoading(false);
  };

  useEffect(() => {
    fetchAllUsers();
  }, [userIds.join(",")]); // Re-run when userIds array changes

  return {
    users,
    loading,
    errors,
    refetchAll: fetchAllUsers,
  };
}
