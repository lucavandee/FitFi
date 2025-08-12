import { useEffect, useState } from "react";
import type { TribePost } from "@/services/data/types";
import { getTribePosts, createTribePost } from "@/services/tribes/tribeService";

export function useTribePosts(tribeId: string) {
  const [posts, setPosts] = useState<TribePost[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    getTribePosts(tribeId)
      .then(p => { if (alive) setPosts(p); })
      .catch(e => { if (alive) setError(String(e?.message ?? e)); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [tribeId]);

  async function addPost(input: Omit<TribePost, "id" | "created_at" | "likes_count" | "comments_count">) {
    // Create optimistic post
    const optimistic = {
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      likes_count: 0,
      comments_count: 0,
      ...input,
    } as TribePost;

    // Optimistic update - add to top of list
    setPosts(prev => prev ? [optimistic, ...prev] : [optimistic]);
    
    try {
      const saved = await createTribePost(input);
      
      // Replace optimistic post with real data
      setPosts(prev => prev?.map(p => (p.id === optimistic.id ? saved : p)) ?? [saved]);
      
      // Optional: Refresh posts list to ensure consistency (only if needed)
      try {
        const updatedPosts = await getTribePosts(tribeId);
        setPosts(updatedPosts);
      } catch (refreshError) {
        console.warn('[TribePosts] Could not refresh after post creation, keeping optimistic state');
        // Keep optimistic state if refresh fails
      }
      
      return saved;
    } catch (e) {
      // Remove optimistic post on error
      setPosts(prev => prev?.filter(p => p.id !== optimistic.id) ?? null);
      throw e;
    }
  }

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);
      const updatedPosts = await getTribePosts(tribeId);
      setPosts(updatedPosts);
    } catch (e) {
      setError(String(e?.message ?? e));
    } finally {
      setLoading(false);
    }
  };

  return { posts, loading, error, addPost, refetch };
}