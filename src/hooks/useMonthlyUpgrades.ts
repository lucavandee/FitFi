import { useQuery } from "@tanstack/react-query";
import { getCachedMonthlyUpgradeCount } from "@/services/subscription/subscriptionStatsService";

export function useMonthlyUpgrades() {
  return useQuery({
    queryKey: ["monthly-upgrades"],
    queryFn: getCachedMonthlyUpgradeCount,
    staleTime: 1000 * 60 * 15,
    cacheTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}
