import { supabase } from "@/lib/supabaseClient";
import { withTimeout } from "@/lib/net/withTimeout";
import { withRetry } from "@/lib/net/withRetry";
import { DATA_CONFIG } from "@/config/dataConfig";
import type { Tribe, TribePost, TribeMember } from "@/services/data/types";
import {
  lt_joinTribe,
  lt_leaveTribe,
  lt_isMember,
  lt_addPost,
  lt_getPosts,
  lt_getMembers,
} from "@/services/data/localTribeStore";

// Configuration
const TIMEOUT_MS = Number(
  import.meta.env.VITE_SUPABASE_HEALTHCHECK_TIMEOUT_MS || 3500,
);
const MAX_ATTEMPTS = Number(
  import.meta.env.VITE_SUPABASE_RETRY_MAX_ATTEMPTS || 3,
);
const BASE_DELAY = Number(import.meta.env.VITE_SUPABASE_RETRY_BASE_MS || 400);

/**
 * Get Supabase client with null safety
 */
function getClient() {
  const client = supabase();
  if (!client) {
    console.log(
      "[TribeService] Supabase not available - using localStorage fallback",
    );
  }
  return client;
}

/**
 * Execute operation with timeout and retry
 */
async function executeWithRetry<T>(
  operation: () => Promise<T>,
  operationName: string,
): Promise<T> {
  const runner = async () => {
    const sb = getClient();
    if (!sb) throw new Error("Supabase client not available");
    return await operation();
  };

  return await withTimeout(
    withRetry(runner, MAX_ATTEMPTS, BASE_DELAY),
    TIMEOUT_MS,
    operationName,
  );
}

/**
 * Get tribe members with fallback
 */
export async function getTribeMembers(tribeId: string): Promise<TribeMember[]> {
  const sb = getClient();

  // Use Supabase if available
  if (sb && DATA_CONFIG.USE_SUPABASE) {
    try {
      const { data, error } = await executeWithRetry(async () => {
        return await sb
          .from("tribe_members")
          .select(
            `
            *,
            user_profile:profiles!tribe_members_user_id_fkey(full_name, avatar_url)
          `,
          )
          .eq("tribe_id", tribeId);
      }, "get_tribe_members");

      if (error) throw error;

      console.log(
        `[TribeService] Loaded ${(data || []).length} members from Supabase`,
      );
      return data || [];
    } catch (error) {
      console.warn(
        "[TribeService] Supabase members failed, using localStorage:",
        error,
      );
    }
  }

  // Fallback to localStorage
  const localMembers = lt_getMembers(tribeId);
  console.log(
    `[TribeService] Using ${localMembers.length} members from localStorage`,
  );
  return localMembers;
}

/**
 * Join tribe with fallback
 */
export async function joinTribe(
  tribeId: string,
  userId: string,
): Promise<TribeMember> {
  const sb = getClient();

  // Try Supabase first if available
  if (sb && DATA_CONFIG.USE_SUPABASE) {
    try {
      const { data, error } = await executeWithRetry(async () => {
        return await sb
          .from("tribe_members")
          .insert({
            tribe_id: tribeId,
            user_id: userId,
            role: "member",
          })
          .select()
          .single();
      }, "join_tribe");

      if (error) {
        // Handle duplicate membership
        if (error.code === "23505") {
          throw new Error("Already a member");
        }
        throw error;
      }

      console.log(`[TribeService] Joined tribe ${tribeId} via Supabase`);
      return data;
    } catch (error) {
      console.warn(
        "[TribeService] Supabase join failed, using localStorage:",
        error,
      );

      // If it's a duplicate error, don't fallback
      if ((error as any)?.message?.includes("Already a member")) {
        throw error;
      }
    }
  }

  // Fallback to localStorage
  const success = lt_joinTribe(tribeId, userId);
  if (!success) {
    throw new Error("Already a member");
  }

  console.log(`[TribeService] Joined tribe ${tribeId} via localStorage`);
  return {
    id: `local_${Date.now()}`,
    tribe_id: tribeId,
    user_id: userId,
    role: "member",
    joined_at: new Date().toISOString(),
  };
}

/**
 * Leave tribe with fallback
 */
export async function leaveTribe(
  tribeId: string,
  userId: string,
): Promise<void> {
  const sb = getClient();

  // Try Supabase first if available
  if (sb && DATA_CONFIG.USE_SUPABASE) {
    try {
      const { error } = await executeWithRetry(async () => {
        return await sb
          .from("tribe_members")
          .delete()
          .eq("tribe_id", tribeId)
          .eq("user_id", userId);
      }, "leave_tribe");

      if (error) throw error;

      console.log(`[TribeService] Left tribe ${tribeId} via Supabase`);
      return;
    } catch (error) {
      console.warn(
        "[TribeService] Supabase leave failed, using localStorage:",
        error,
      );
    }
  }

  // Fallback to localStorage
  const success = lt_leaveTribe(tribeId, userId);
  if (!success) {
    throw new Error("Not a member");
  }

  console.log(`[TribeService] Left tribe ${tribeId} via localStorage`);
}

/**
 * Get tribe posts with fallback
 */
export async function getTribePosts(
  tribeId: string,
  options?: {
    limit?: number;
    offset?: number;
  },
): Promise<TribePost[]> {
  const sb = getClient();

  // Use Supabase if available
  if (sb && DATA_CONFIG.USE_SUPABASE) {
    try {
      const { data, error } = await executeWithRetry(async () => {
        let query = sb
          .from("tribe_posts")
          .select(
            `
            *,
            user_profile:profiles!tribe_posts_user_id_fkey(full_name, avatar_url),
            outfit:outfits(id, title, image_url, match_percentage)
          `,
          )
          .eq("tribe_id", tribeId)
          .order("created_at", { ascending: false });

        if (options?.limit) {
          query = query.limit(options.limit);
        }
        if (options?.offset) {
          query = query.range(
            options.offset,
            options.offset + (options.limit || 10) - 1,
          );
        }

        return await query;
      }, "get_tribe_posts");

      if (error) throw error;

      console.log(
        `[TribeService] Loaded ${(data || []).length} posts from Supabase`,
      );
      return data || [];
    } catch (error) {
      console.warn(
        "[TribeService] Supabase posts failed, using localStorage:",
        error,
      );
    }
  }

  // Fallback to localStorage
  const localPosts = lt_getPosts(tribeId);
  console.log(
    `[TribeService] Using ${localPosts.length} posts from localStorage`,
  );
  return localPosts;
}

/**
 * Create tribe post with fallback
 */
export async function createTribePost(
  post: Omit<TribePost, "id" | "created_at" | "likes_count" | "comments_count">,
): Promise<TribePost> {
  const sb = getClient();

  // Try Supabase first if available
  if (sb && DATA_CONFIG.USE_SUPABASE) {
    try {
      const { data, error } = await executeWithRetry(async () => {
        return await sb
          .from("tribe_posts")
          .insert({
            tribe_id: post.tribe_id,
            user_id: post.user_id,
            content: post.content,
            image_url: post.image_url,
            outfit_id: post.outfit_id,
          })
          .select(
            `
            *,
            user_profile:profiles!tribe_posts_user_id_fkey(full_name, avatar_url),
            outfit:outfits(id, title, image_url, match_percentage)
          `,
          )
          .single();
      }, "create_tribe_post");

      if (error) throw error;

      console.log(`[TribeService] Created post via Supabase: ${data.id}`);
      return data;
    } catch (error) {
      console.warn(
        "[TribeService] Supabase post creation failed, using localStorage:",
        error,
      );
    }
  }

  // Fallback to localStorage
  const newPost = lt_addPost(post);
  console.log(`[TribeService] Created post via localStorage: ${newPost.id}`);
  return newPost;
}
