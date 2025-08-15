import { supabase } from "@/lib/supabaseClient";
import { DATA_CONFIG } from "@/config/dataConfig";
import { fetchReferralsByInviter } from "./referralsService";
import type { UserStats, UserStreak, Referral, NotificationItem } from "@/services/data/types";

const LS_STATS = (userId: string) => `fitfi.local.userStats.${userId}`;
const LS_STREAK = (userId: string) => `fitfi.local.userStreak.${userId}`;

function lsRead<T>(key: string, fallback: T): T {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback; } catch { return fallback; }
}
function lsWrite<T>(key: string, value: T) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

function readLocalStats(userId: string) {
  return lsRead<UserStats | null>(LS_STATS(userId), { user_id: userId, level: 1, xp: 0, updated_at: new Date().toISOString(), last_active: new Date().toISOString() });
}
function writeLocalStats(stats: UserStats) {
  lsWrite(LS_STATS(stats.user_id), { ...stats, updated_at: new Date().toISOString(), last_active: new Date().toISOString() });
  return stats;
}

function readLocalStreak(userId: string) {
  return lsRead<UserStreak>(LS_STREAK(userId), { user_id: userId, current_streak: 0, longest_streak: 0, last_check_date: new Date(0).toISOString() });
}
function writeLocalStreak(streak: UserStreak) {
  lsWrite(LS_STREAK(streak.user_id), streak);
  return streak;
}

const T = {
  stats: "user_stats",
  streaks: "user_streaks",
  referrals: "referrals",
  notifications: "notifications",
};

export async function fetchUserStats(userId: string): Promise<UserStats | null> {
  const sb = supabase();
  if (!sb) return readLocalStats(userId);
  const { data, error } = await sb.from(T.stats).select("*").eq("user_id", userId).single();
  if (error && error.code !== "PGRST116") throw error;
  return data ?? readLocalStats(userId);
}

export async function upsertUserStats(stats: UserStats): Promise<UserStats> {
  const sb = supabase();
  if (!sb) return writeLocalStats(stats);
  const { data, error } = await sb.from(T.stats).upsert(stats).select().single();
  if (error) throw error;
  return data!;
}

export async function fetchUserStreak(userId: string): Promise<UserStreak> {
  const sb = supabase();
  if (!sb) return readLocalStreak(userId);
  const { data, error } = await sb.from(T.streaks).select("*").eq("user_id", userId).single();
  if (error && error.code !== "PGRST116") throw error;
  return data ?? readLocalStreak(userId);
}

export async function touchDailyStreak(userId: string): Promise<UserStreak> {
  const sb = supabase();
  const today = new Date().toISOString().slice(0,10);
  if (!sb) {
    // local fallback
    const cur = readLocalStreak(userId);
    const last = cur.last_check_date?.slice(0,10);
    let current_streak = cur.current_streak;
    let longest_streak = cur.longest_streak ?? 0;
    if (last !== today) {
      // nieuwe dag -> ++ of reset als gap? (simple: altijd ++)
      current_streak = (last && last !== today) ? current_streak + 1 : Math.max(1, current_streak + 1);
      longest_streak = Math.max(longest_streak, current_streak);
    }
    return writeLocalStreak({ user_id: userId, current_streak, longest_streak, last_check_date: new Date().toISOString() });
  }
  // Supabase pad
  const current = await fetchUserStreak(userId);
  const last = current?.last_check_date?.slice(0,10);
  let current_streak = current?.current_streak ?? 0;
  let longest_streak = current?.longest_streak ?? 0;
  if (last !== today) {
    current_streak = current_streak + 1;
    longest_streak = Math.max(longest_streak, current_streak);
  }
  const { data, error } = await sb.from(T.streaks).upsert({
    user_id: userId,
    current_streak,
    longest_streak,
    last_check_date: new Date().toISOString()
  }).select().single();
  if (error) throw error;
  return data!;
}

export async function fetchReferrals(inviterId: string): Promise<Referral[]> {
  try {
    const referralData = await fetchReferralsByInviter(inviterId);
    return referralData.map(r => ({
      id: r.id,
      inviter_id: r.inviter_id || r.inviterId || inviterId,
      invitee_email: null,
      status: (r.status as "pending" | "joined" | "converted") || "pending",
      created_at: r.created_at || new Date().toISOString()
    }));
  } catch (error) {
    console.warn('[DashboardService] fetchReferrals failed:', error);
    return [];
  }
}

export async function fetchNotifications(userId: string): Promise<NotificationItem[]> {
  const sb = supabase(); if (!sb) return [];
  const { data, error } = await sb.from(T.notifications).select("*").eq("user_id", userId).order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as NotificationItem[];
}

export async function addXp(userId: string, amount: number, reason?: string) {
  const sb = supabase();
  // fallback
  if (!sb) {
    const cur = await fetchUserStats(userId);
    const xp = (cur?.xp ?? 0) + amount;
    const level = Math.max(1, Math.floor(xp / 100) + 1);
    return writeLocalStats({ user_id: userId, xp, level, updated_at: new Date().toISOString(), last_active: new Date().toISOString() });
  }
  // supabase
  const cur = await fetchUserStats(userId);
  const xp = (cur?.xp ?? 0) + amount;
  const level = Math.max(1, Math.floor(xp / 100) + 1);
  const { data, error } = await sb.from("user_stats").upsert({
    user_id: userId,
    xp,
    level,
    updated_at: new Date().toISOString(),
    last_active: new Date().toISOString(),
  }).select().single();
  if (error) throw error;
  return data;
}