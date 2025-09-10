import type { TribeMember, TribePost } from "@/services/data/types";
import {
  lt_joinTribe,
  lt_leaveTribe,
  lt_isMember,
  lt_addPost,
  lt_getPosts,
  lt_getMembers,
} from "@/services/data/localTribeStore";

/** Normaliseert members/posts zodat zowel camelCase als snake_case aanwezig is. */
function normalizeMember(m: TribeMember): TribeMember {
  const userId = (m as any).userId ?? (m as any).user_id ?? null;
  const tribeId = (m as any).tribeId ?? (m as any).tribe_id ?? null;
  const role = (m as any).role ?? "member";
  return {
    ...m,
    userId: userId ?? undefined,
    user_id: userId ?? undefined,
    tribeId: tribeId ?? undefined,
    tribe_id: tribeId ?? undefined,
    role,
  };
}

function normalizePost(p: TribePost): TribePost {
  const tribeId = (p as any).tribeId ?? (p as any).tribe_id ?? undefined;
  const userId = (p as any).userId ?? (p as any).user_id ?? undefined;
  const createdAt =
    (p as any).createdAt ?? (p as any).created_at ?? new Date().toISOString();
  return {
    ...p,
    tribeId,
    tribe_id: tribeId,
    userId,
    user_id: userId,
    createdAt,
    created_at: createdAt,
    likes_count: p.likes_count ?? 0,
    comments_count: p.comments_count ?? 0,
  };
}

/** Primaire API */
export async function listMembers(tribeId: string): Promise<TribeMember[]> {
  return lt_getMembers(tribeId).map(normalizeMember);
}

/** Alias die door hooks wordt gebruikt (zoals useTribeMembership). */
export async function getTribeMembers(tribeId: string): Promise<TribeMember[]> {
  return listMembers(tribeId);
}

export async function joinTribe(
  tribeId: string,
  userId: string
): Promise<TribeMember> {
  const m = lt_joinTribe(tribeId, userId);
  return normalizeMember(m);
}

export async function leaveTribe(
  tribeId: string,
  userId: string
): Promise<boolean> {
  return lt_leaveTribe(tribeId, userId);
}

export async function isMember(
  tribeId: string,
  userId: string
): Promise<boolean> {
  return lt_isMember(tribeId, userId);
}

export async function createPost(
  input: Omit<TribePost, "id" | "createdAt" | "likes_count" | "comments_count">
): Promise<TribePost> {
  const p = lt_addPost(input);
  return normalizePost(p);
}

export async function listPosts(tribeId: string): Promise<TribePost[]> {
  return lt_getPosts(tribeId).map(normalizePost);
}

export default {
  listMembers,
  getTribeMembers,
  joinTribe,
  leaveTribe,
  isMember,
  createPost,
  listPosts,
};