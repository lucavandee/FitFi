import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  fetchUserStats, 
  upsertUserStats, 
  fetchUserStreak, 
  touchDailyStreak, 
  fetchReferrals, 
  fetchNotifications, 
  addXp 
} from "@/services/dashboard/dashboardService";

export const useUserStats = (userId?: string) =>
  useQuery({ queryKey: ["userStats", userId], queryFn: () => fetchUserStats(userId!), enabled: !!userId });

export const useTouchStreak = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => touchDailyStreak(userId),
    onSuccess: (_d, userId) => {
      qc.invalidateQueries({ queryKey: ["userStreak", userId] });
      qc.invalidateQueries({ queryKey: ["userStats", userId] });
    }
  });
};

export const useAddXp = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, amount, reason }: { userId: string; amount: number; reason?: string }) => 
      addXp(userId, amount, reason),
    onSuccess: (_data, { userId }) => {
      qc.invalidateQueries({ queryKey: ["userStats", userId] });
      qc.invalidateQueries({ queryKey: ["userStreak", userId] });
    }
  });
};

export const useUserStreak = (userId?: string) =>
  useQuery({ queryKey: ["userStreak", userId], queryFn: () => fetchUserStreak(userId!), enabled: !!userId });

export const useReferrals = (userId?: string) =>
  useQuery({ queryKey: ["referrals", userId], queryFn: () => fetchReferrals(userId!), enabled: !!userId });

export const useNotifications = (userId?: string) =>
  useQuery({ queryKey: ["notifications", userId], queryFn: () => fetchNotifications(userId!), enabled: !!userId });