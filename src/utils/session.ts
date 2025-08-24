import type { FitfiTier } from "@/config/novaAccess";
import { NOVA_ACCESS } from "@/config/novaAccess";

const TIER_KEY = "fitfi_tier";
const UID_KEY = "fitfi_uid";
const USAGE_KEY_PREFIX = "fitfi.nova.usage";

export function getUserTier(): FitfiTier {
  const v = (localStorage.getItem(TIER_KEY) || "").toLowerCase();
  if (v === "member" || v === "plus" || v === "founder") return v as FitfiTier;
  return "visitor";
}

export function setUserTier(tier: FitfiTier) {
  localStorage.setItem(TIER_KEY, tier);
}

export function getUID(): string {
  let uid = localStorage.getItem(UID_KEY);
  if (!uid) {
    uid = crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
    localStorage.setItem(UID_KEY, uid);
  }
  return uid;
}

export function hasValidSession(): boolean {
  // Check for basic session indicators
  const hasUID = !!localStorage.getItem(UID_KEY);
  const hasCookie = document.cookie.includes("fitfi_uid");
  const hasAuthCookie =
    document.cookie.includes("sb-") || document.cookie.includes("supabase");

  return hasUID || hasCookie || hasAuthCookie;
}

function getToday(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function getThisWeek(): string {
  const now = new Date();
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
  return startOfWeek.toISOString().slice(0, 10);
}

function getUsageKey(period: "day" | "week", userId: string): string {
  const date = period === "day" ? getToday() : getThisWeek();
  return `${USAGE_KEY_PREFIX}.${period}.${date}.${userId}`;
}

function getUsageCount(period: "day" | "week", userId: string): number {
  try {
    const key = getUsageKey(period, userId);
    const stored = localStorage.getItem(key);
    return stored ? parseInt(stored, 10) || 0 : 0;
  } catch {
    return 0;
  }
}

function setUsageCount(
  period: "day" | "week",
  userId: string,
  count: number,
): void {
  try {
    const key = getUsageKey(period, userId);
    localStorage.setItem(key, count.toString());
  } catch {
    // Ignore localStorage errors
  }
}

export function checkQuotaLimit(tier: FitfiTier, userId: string): boolean {
  const limits = NOVA_ACCESS.limits[tier];
  const dailyUsage = getUsageCount("day", userId);
  const weeklyUsage = getUsageCount("week", userId);

  return dailyUsage < limits.perDay && weeklyUsage < limits.perWeek;
}

export function incrementUsage(tier: FitfiTier, userId: string): void {
  const dailyUsage = getUsageCount("day", userId);
  const weeklyUsage = getUsageCount("week", userId);

  setUsageCount("day", userId, dailyUsage + 1);
  setUsageCount("week", userId, weeklyUsage + 1);
}

export function getRemainingQuota(
  tier: FitfiTier,
  userId: string,
): {
  daily: { remaining: number; limit: number };
  weekly: { remaining: number; limit: number };
} {
  const limits = NOVA_ACCESS.limits[tier];
  const dailyUsed = getUsageCount("day", userId);
  const weeklyUsed = getUsageCount("week", userId);

  return {
    daily: {
      remaining: Math.max(0, limits.perDay - dailyUsed),
      limit: limits.perDay,
    },
    weekly: {
      remaining: Math.max(0, limits.perWeek - weeklyUsed),
      limit: limits.perWeek,
    },
  };
}

export function getUsageStats(
  tier: FitfiTier,
  userId: string,
): {
  daily: { used: number; limit: number; remaining: number };
  weekly: { used: number; limit: number; remaining: number };
} {
  const limits = NOVA_ACCESS.limits[tier];
  const dailyUsed = getUsageCount("day", userId);
  const weeklyUsed = getUsageCount("week", userId);

  return {
    daily: {
      used: dailyUsed,
      limit: limits.perDay,
      remaining: Math.max(0, limits.perDay - dailyUsed),
    },
    weekly: {
      used: weeklyUsed,
      limit: limits.perWeek,
      remaining: Math.max(0, limits.perWeek - weeklyUsed),
    },
  };
}
