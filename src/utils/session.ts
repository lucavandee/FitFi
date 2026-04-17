import type { FitfiTier } from '@/config/novaAccess';
import { NOVA_ACCESS } from '@/config/novaAccess';

/**
 * SECURITY — client-side counters in this module are a UX hint, NOT an
 * enforcement boundary. An attacker can trivially reset them with
 * `localStorage.clear()` from DevTools and bypass any client-side quota check.
 *
 * The authoritative quota MUST be enforced server-side. The Nova edge
 * function should:
 *   1. Look up the caller's tier from `auth.uid()` / Supabase JWT (never
 *      trust a tier passed from the client).
 *   2. Increment a server-side counter (e.g. via the existing
 *      `check_rate_limit` RPC, scoped per user_id + day/week).
 *   3. Return `{ code: 'quota_exceeded' }` (already handled by NovaChat) when
 *      the limit is reached, instead of relying on the client to refuse.
 *
 * Until that server-side enforcement is in place, treat the values returned
 * by `checkQuotaLimit` / `getUsageStats` as advisory only.
 */
const TIER_KEY = 'fitfi_tier';
const UID_KEY  = 'fitfi_uid';
const USAGE_KEY_PREFIX = 'fitfi.nova.usage';

/**
 * SECURITY: returns the tier hint stored in localStorage. The client can set
 * any value here, so the server MUST re-derive the real tier from the user's
 * subscription record before honouring premium-gated requests.
 */
export function getUserTier(): FitfiTier {
  const v = (localStorage.getItem(TIER_KEY) || '').toLowerCase();
  if (v === 'member' || v === 'plus' || v === 'founder') return v as FitfiTier;
  return 'visitor';
}

export function setUserTier(tier: FitfiTier) {
  localStorage.setItem(TIER_KEY, tier);
}

export function getUID(): string {
  let uid = localStorage.getItem(UID_KEY);
  if (!uid) {
    uid = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
    localStorage.setItem(UID_KEY, uid);
  }
  return uid;
}

function getToday(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function getThisWeek(): string {
  const now = new Date();
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
  return startOfWeek.toISOString().slice(0, 10);
}

function getUsageKey(period: 'day' | 'week', userId: string): string {
  const date = period === 'day' ? getToday() : getThisWeek();
  return `${USAGE_KEY_PREFIX}.${period}.${date}.${userId}`;
}

function getUsageCount(period: 'day' | 'week', userId: string): number {
  try {
    const key = getUsageKey(period, userId);
    const stored = localStorage.getItem(key);
    return stored ? parseInt(stored, 10) || 0 : 0;
  } catch {
    return 0;
  }
}

function setUsageCount(period: 'day' | 'week', userId: string, count: number): void {
  try {
    const key = getUsageKey(period, userId);
    localStorage.setItem(key, count.toString());
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * UX-only quota check. Used to surface the QuotaModal before a request so
 * the user sees feedback without a network round-trip. The server quota is
 * authoritative — see the `quota_exceeded` SSE event in NovaChat.
 */
export function checkQuotaLimit(tier: FitfiTier, userId: string): boolean {
  const limits = NOVA_ACCESS.limits[tier];
  const dailyUsage = getUsageCount('day', userId);
  const weeklyUsage = getUsageCount('week', userId);

  return dailyUsage < limits.perDay && weeklyUsage < limits.perWeek;
}

export function incrementUsage(tier: FitfiTier, userId: string): void {
  const dailyUsage = getUsageCount('day', userId);
  const weeklyUsage = getUsageCount('week', userId);
  
  setUsageCount('day', userId, dailyUsage + 1);
  setUsageCount('week', userId, weeklyUsage + 1);
}

export function getUsageStats(tier: FitfiTier, userId: string): {
  daily: { used: number; limit: number; remaining: number };
  weekly: { used: number; limit: number; remaining: number };
} {
  const limits = NOVA_ACCESS.limits[tier];
  const dailyUsed = getUsageCount('day', userId);
  const weeklyUsed = getUsageCount('week', userId);
  
  return {
    daily: {
      used: dailyUsed,
      limit: limits.perDay,
      remaining: Math.max(0, limits.perDay - dailyUsed)
    },
    weekly: {
      used: weeklyUsed,
      limit: limits.perWeek,
      remaining: Math.max(0, limits.perWeek - weeklyUsed)
    }
  };
}