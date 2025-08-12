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

  async function addPost(input: Omit<TribePost, "id" | "createdAt" | "likes" | "commentsCount">) {
    const optimistic = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      likes: 0,
      commentsCount: 0,
      ...input,
    } as TribePost;

    setPosts(prev => prev ? [optimistic, ...prev] : [optimistic]);
    try {
      const saved = await createTribePost(input);
      setPosts(prev => prev?.map(p => (p.id === optimistic.id ? saved : p)) ?? [saved]);
      return saved;
    } catch (e) {
      setPosts(prev => prev?.filter(p => p.id !== optimistic.id) ?? null);
      throw e;
    }
  }

  return { posts, loading, error, addPost };
}