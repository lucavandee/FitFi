import { useEffect, useState } from "react";
import type { TribePost } from "@/services/data/types";

// Mock service for tribe posts
const mockTribePostsService = {
  async getTribePosts(tribeId: string): Promise<TribePost[]> {
    // Return mock posts for demonstration
    return [
      {
        id: `post_${tribeId}_1`,
        tribe_id: tribeId,
        user_id: "user_1",
        authorId: "user_1",
        authorName: "Emma S.",
        content:
          "Mijn favoriete winter look! Warme wollen jas gecombineerd met comfortabele boots.",
        image_url:
          "https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=2",
        likes_count: 12,
        comments_count: 3,
        likes: 12,
        commentsCount: 3,
        created_at: new Date(
          Date.now() - 2 * 24 * 60 * 60 * 1000,
        ).toISOString(),
      },
      {
        id: `post_${tribeId}_2`,
        tribe_id: tribeId,
        user_id: "user_2",
        authorId: "user_2",
        authorName: "Lisa M.",
        content:
          "Vintage thrift find gecombineerd met moderne accessoires. Duurzaam én stijlvol!",
        image_url:
          "https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=2",
        likes_count: 8,
        comments_count: 1,
        likes: 8,
        commentsCount: 1,
        created_at: new Date(
          Date.now() - 1 * 24 * 60 * 60 * 1000,
        ).toISOString(),
      },
    ];
  },

  async createTribePost(
    input: Omit<
      TribePost,
      "id" | "created_at" | "likes_count" | "comments_count"
    >,
  ): Promise<TribePost> {
    const newPost: TribePost = {
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      likes_count: 0,
      comments_count: 0,
      likes: 0,
      commentsCount: 0,
      authorId: input.user_id,
      authorName: `User ${input.user_id.slice(-4)}`,
      ...input,
    };
    return newPost;
  },
};

export function useTribePosts(tribeId: string) {
  const [posts, setPosts] = useState<TribePost[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    mockTribePostsService
      .getTribePosts(tribeId)
      .then((p) => {
        if (alive) setPosts(p);
      })
      .catch((e) => {
        if (alive) setError(String(e?.message ?? e));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [tribeId]);

  async function addPost(
    input: Omit<
      TribePost,
      "id" | "created_at" | "likes_count" | "comments_count"
    >,
  ) {
    try {
      const saved = await mockTribePostsService.createTribePost(input);

      // Add to top of list
      setPosts((prev) => (prev ? [saved, ...prev] : [saved]));

      return saved;
    } catch (e) {
      throw e;
    }
  }

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);
      const updatedPosts = await mockTribePostsService.getTribePosts(tribeId);
      setPosts(updatedPosts);
    } catch (e) {
      setError(String(e?.message ?? e));
    } finally {
      setLoading(false);
    }
  };

  return { posts, loading, error, addPost, refetch };
}
