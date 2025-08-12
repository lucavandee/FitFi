import { supabase } from "@/lib/supabaseClient";
import { DATA_CONFIG } from "@/config/dataConfig";
import type { UserStats, UserStreak, Referral, NotificationItem } from "@/services/data/types";
import type { UserStats, UserStreak, Referral, NotificationItem } from "@/services/data/types";

const T = {
  stats: "user_stats",
  streaks: "user_streaks",
  referrals: "referrals",
  notifications: "notifications",
};

export async function fetchUserStats(userId: string): Promise<UserStats | null> {
  const sb = supabase(); if (!sb) return null;
  const { data, error } = await sb.from(T.stats).select("*").eq("user_id", userId).single();
  if (error && error.code !== "PGRST116") throw error;
  return data ?? null;
}

export async function upsertUserStats(p: Partial<UserStats> & { user_id: string }) {
  const sb = supabase(); if (!sb) return null;
  const { data, error } = await sb.from(T.stats).upsert(p).select().single();
  if (error) throw error;
  return data as UserStats;
}

export async function fetchUserStreak(userId: string): Promise<UserStreak | null> {
  const sb = supabase(); if (!sb) return null;
  const { data, error } = await sb.from(T.streaks).select("*").eq("user_id", userId).single();
  if (error && error.code !== "PGRST116") throw error;
  return data ?? null;
}

export async function touchDailyStreak(userId: string): Promise<UserStreak> {
  const today = new Date().toISOString().slice(0,10);
  const current = await fetchUserStreak(userId);
  let next: UserStreak;
  if (!current) {
    next = { user_id: userId, current_streak: 1, longest_streak: 1, last_check_date: today };
  } else {
    const last = current.last_check_date;
    if (last === today) { next = current; }
    else {
      const dLast = new Date(last); const dToday = new Date(today);
      const diff = (Number(dToday) - Number(dLast)) / (1000*60*60*24);
      const cur = diff === 1 ? current.current_streak + 1 : 1;
      next = {
        user_id: userId,
        current_streak: cur,
        longest_streak: Math.max(current.longest_streak, cur),
        last_check_date: today
      };
    }
  }
  const sb = supabase()!;
  const { data, error } = await sb.from(T.streaks).upsert(next).select().single();
  if (error) throw error;
  return data as UserStreak;
}

export async function fetchReferrals(inviterId: string): Promise<Referral[]> {
  const sb = supabase(); if (!sb) return [];
  const { data, error } = await sb.from(T.referrals).select("*").eq("inviter_id", inviterId).order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Referral[];
}

export async function fetchNotifications(userId: string): Promise<NotificationItem[]> {
  const sb = supabase(); if (!sb) return [];
  const { data, error } = await sb.from(T.notifications).select("*").eq("user_id", userId).order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as NotificationItem[];
}

export async function addXp(userId: string, amount: number, reason?: string) {
  const sb = supabase(); if (!sb) throw new Error("No Supabase client");
  // fetch huidige stats
  const cur = await fetchUserStats(userId);
  const xp = (cur?.xp ?? 0) + amount;
  const level = Math.max(1, Math.floor(xp / 100) + 1); // simpele curve: 100xp per level
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