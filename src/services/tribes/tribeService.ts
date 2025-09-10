import type { TribeMember, TribePost } from "@/services/data/types";
import { lt_joinTribe, lt_leaveTribe, lt_isMember, lt_addPost, lt_getPosts, lt_getMembers } from "@/services/data/localTribeStore";

export async function listMembers(tribeId: string): Promise<TribeMember[]> {
  return lt_getMembers(tribeId);
}

export async function joinTribe(tribeId: string, userId: string): Promise<TribeMember> {
  return lt_joinTribe(tribeId, userId);
}

export async function leaveTribe(tribeId: string, userId: string): Promise<boolean> {
  return lt_leaveTribe(tribeId, userId);
}

export async function isMember(tribeId: string, userId: string): Promise<boolean> {
  return lt_isMember(tribeId, userId);
}

export async function createPost(input: Omit<TribePost, "id" | "createdAt" | "likes_count" | "comments_count">): Promise<TribePost> {
  return lt_addPost(input);
}

export async function listPosts(tribeId: string): Promise<TribePost[]> {
  return lt_getPosts(tribeId);
}