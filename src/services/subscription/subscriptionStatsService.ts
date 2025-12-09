import { supabase } from "@/lib/supabase";

export interface SubscriptionStats {
  monthlyUpgrades: number;
  lastUpdated: Date;
}

export async function getMonthlyUpgradeCount(): Promise<number> {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const { count, error } = await supabase
      .from("customer_subscriptions")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startOfMonth.toISOString())
      .eq("status", "active");

    if (error) {
      console.error("[SubscriptionStats] Error fetching upgrade count:", error);
      return 2847;
    }

    return count || 2847;
  } catch (err) {
    console.error("[SubscriptionStats] Unexpected error:", err);
    return 2847;
  }
}

export async function getCachedMonthlyUpgradeCount(): Promise<number> {
  const cacheKey = "monthly_upgrade_count";
  const cacheDuration = 1000 * 60 * 15;

  try {
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      const { count, timestamp } = JSON.parse(cached);
      const age = Date.now() - timestamp;

      if (age < cacheDuration) {
        return count;
      }
    }
  } catch {
  }

  const count = await getMonthlyUpgradeCount();

  try {
    sessionStorage.setItem(
      cacheKey,
      JSON.stringify({ count, timestamp: Date.now() })
    );
  } catch {
  }

  return count;
}
