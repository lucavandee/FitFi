import type { TribeMember, TribePost } from "@/services/data/types";

const LS_MEMBERS = "fitfi.local.tribeMembers";
const LS_POSTS = "fitfi.local.tribePosts";

function read<T>(key: string, fallback: T): T {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback; } catch { return fallback; }
}
function write<T>(key: string, value: T) { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} }

export function lt_getMembers(tribeId: string): TribeMember[] {
  const all = read<Record<string, TribeMember[]>>(LS_MEMBERS, {});
  return all[tribeId] ?? [];
}
export function lt_setMembers(tribeId: string, members: TribeMember[]) {
  const all = read<Record<string, TribeMember[]>>(LS_MEMBERS, {});
  all[tribeId] = members;
  write(LS_MEMBERS, all);
}

export function lt_isMember(tribeId: string, userId: string): boolean {
  return lt_getMembers(tribeId).some(m => (m.userId || m.user_id) === userId);
}

export function lt_joinTribe(tribeId: string, userId: string): TribeMember {
  const members = lt_getMembers(tribeId);
  if (members.some(m => (m.userId || m.user_id) === userId)) return members.find(m => (m.userId || m.user_id) === userId)!;
  const newMember: TribeMember = { id: crypto.randomUUID(), tribeId, userId, role: "member" };
  lt_setMembers(tribeId, [newMember, ...members]);
  return newMember;
}

export function lt_leaveTribe(tribeId: string, userId: string): boolean {
  const members = lt_getMembers(tribeId);
  const updated = members.filter(m => (m.userId || m.user_id) !== userId);
  if (updated.length === members.length) return false;
  lt_setMembers(tribeId, updated);
  return true;
}

export function lt_getPosts(tribeId: string): TribePost[] {
  const all = read<Record<string, TribePost[]>>(LS_POSTS, {});
  return all[tribeId] ?? [];
}
export function lt_setPosts(tribeId: string, posts: TribePost[]) {
  const all = read<Record<string, TribePost[]>>(LS_POSTS, {});
  all[tribeId] = posts;
  write(LS_POSTS, all);
}

export function lt_addPost(post: Omit<TribePost, "id" | "createdAt" | "likes_count" | "comments_count">): TribePost {
  const newPost: TribePost = {
    id: crypto.randomUUID(),
    tribeId: post.tribeId || post.tribe_id,
    userId: post.userId || post.user_id,
    content: post.content || post.body,
    image_url: post.image_url,
    createdAt: new Date().toISOString(),
    likes_count: 0,
    comments_count: 0,
  };
  const posts = lt_getPosts(newPost.tribeId || "");
  lt_setPosts(newPost.tribeId || "", [newPost, ...posts]);
  return newPost;
}

export function lt_toggleLike(tribeId: string, postId: string): number {
  const posts = lt_getPosts(tribeId);
  const idx = posts.findIndex(p => p.id === postId);
  if (idx === -1) return 0;
  const currentLikes = posts[idx].likes_count || 0;
  posts[idx] = { ...posts[idx], likes_count: currentLikes + 1 };
  lt_setPosts(tribeId, posts);
  return posts[idx].likes_count || 0;
}