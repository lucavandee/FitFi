import type { TribeMember, TribePost } from "@/services/data/types";

const LS_MEMBERS = "fitfi.local.tribeMembers";
const LS_POSTS = "fitfi.local.tribePosts";

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function lt_getMembers(tribeId: string): TribeMember[] {
  const all = read<Record<string, TribeMember[]>>(LS_MEMBERS, {});
  return all[tribeId] ?? [];
}

export function lt_setMembers(tribeId: string, members: TribeMember[]) {
  const all = read<Record<string, TribeMember[]>>(LS_MEMBERS, {});
  all[tribeId] = members;
  write(LS_MEMBERS, all);
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

/**
 * Join a tribe (localStorage fallback)
 */
export function lt_joinTribe(tribeId: string, userId: string): boolean {
  try {
    const members = lt_getMembers(tribeId);

    // Check if already a member
    if (members.some((m) => m.user_id === userId)) {
      return false; // Already a member
    }

    // Add new member
    const newMember: TribeMember = {
      id: `member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tribe_id: tribeId,
      user_id: userId,
      role: "member",
      joined_at: new Date().toISOString(),
    };

    lt_setMembers(tribeId, [...members, newMember]);
    return true;
  } catch (error) {
    console.error("[LocalTribeStore] Error joining tribe:", error);
    return false;
  }
}

/**
 * Leave a tribe (localStorage fallback)
 */
export function lt_leaveTribe(tribeId: string, userId: string): boolean {
  try {
    const members = lt_getMembers(tribeId);
    const updatedMembers = members.filter((m) => m.user_id !== userId);

    if (updatedMembers.length === members.length) {
      return false; // User was not a member
    }

    lt_setMembers(tribeId, updatedMembers);
    return true;
  } catch (error) {
    console.error("[LocalTribeStore] Error leaving tribe:", error);
    return false;
  }
}

/**
 * Check if user is member of tribe
 */
export function lt_isMember(tribeId: string, userId: string): boolean {
  try {
    const members = lt_getMembers(tribeId);
    return members.some((m) => m.user_id === userId);
  } catch {
    return false;
  }
}

/**
 * Get user's role in tribe
 */
export function lt_getUserRole(
  tribeId: string,
  userId: string,
): "member" | "moderator" | "owner" | null {
  try {
    const members = lt_getMembers(tribeId);
    const member = members.find((m) => m.user_id === userId);
    return member?.role || null;
  } catch {
    return null;
  }
}

/**
 * Add a post to tribe (localStorage fallback)
 */
export function lt_addPost(
  post: Omit<TribePost, "id" | "created_at" | "likes_count" | "comments_count">,
): TribePost {
  const newPost: TribePost = {
    ...post,
    id: `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    created_at: new Date().toISOString(),
    likes_count: 0,
    comments_count: 0,
  };

  const posts = lt_getPosts(post.tribe_id || "");
  lt_setPosts(post.tribe_id || "", [newPost, ...posts]);

  return newPost;
}

/**
 * Like/unlike a post (localStorage fallback)
 */
export function lt_togglePostLike(
  postId: string,
  tribeId: string,
  userId: string,
): { liked: boolean; newCount: number } {
  try {
    const posts = lt_getPosts(tribeId);
    const postIndex = posts.findIndex((p) => p.id === postId);

    if (postIndex === -1) {
      return { liked: false, newCount: 0 };
    }

    const post = posts[postIndex];
    const currentLikes = post.likes_count || 0;

    // For simplicity, we'll just toggle the like count
    // In a real implementation, we'd track individual user likes
    const liked = Math.random() > 0.5; // Mock like state
    const newCount = liked ? currentLikes + 1 : Math.max(0, currentLikes - 1);

    posts[postIndex] = {
      ...post,
      likes_count: newCount,
    };

    lt_setPosts(tribeId, posts);

    return { liked, newCount };
  } catch (error) {
    console.error("[LocalTribeStore] Error toggling post like:", error);
    return { liked: false, newCount: 0 };
  }
}

/**
 * Get member count for a tribe
 */
export function lt_getMemberCount(tribeId: string): number {
  try {
    const members = lt_getMembers(tribeId);
    return members.length;
  } catch {
    return 0;
  }
}

/**
 * Clear all local tribe data (for testing/reset)
 */
export function lt_clearAll(): void {
  try {
    localStorage.removeItem(LS_MEMBERS);
    localStorage.removeItem(LS_POSTS);
    console.log("[LocalTribeStore] All local tribe data cleared");
  } catch (error) {
    console.error("[LocalTribeStore] Error clearing data:", error);
  }
}
