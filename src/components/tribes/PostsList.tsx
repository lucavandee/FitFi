import React, { useState } from "react";
import {
  Heart,
  MessageCircle,
  MoreHorizontal,
  Flag,
  Trash2,
} from "lucide-react";
import { useTribePosts } from "@/hooks/useTribePosts";
import SmartImage from "@/components/media/SmartImage";
import Button from "@/components/ui/Button";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import toast from "react-hot-toast";

interface PostsListProps {
  tribeId: string;
  userId?: string;
  showComposer?: boolean;
  className?: string;
}

export const PostsList: React.FC<PostsListProps> = ({
  tribeId,
  userId,
  showComposer = true,
  className = "",
}) => {
  const { posts, loading, error, addPost } = useTribePosts(tribeId);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  const handleLike = async (postId: string) => {
    if (!userId) {
      toast.error("Log in om posts te liken");
      return;
    }

    try {
      // Optimistic update
      setLikedPosts((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(postId)) {
          newSet.delete(postId);
        } else {
          newSet.add(postId);
        }
        return newSet;
      });

      // In a real implementation, this would call an API
      // For now, just show success feedback
      toast.success("Like bijgewerkt!");
    } catch (error) {
      console.error("Error liking post:", error);
      toast.error("Kon like niet bijwerken");

      // Revert optimistic update
      setLikedPosts((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(postId)) {
          newSet.delete(postId);
        } else {
          newSet.add(postId);
        }
        return newSet;
      });
    }
  };

  const handleComment = (postId: string) => {
    if (!userId) {
      toast.error("Log in om te reageren");
      return;
    }

    // In a real implementation, this would open a comment modal
    toast.success("Comment functie komt binnenkort!");
  };

  const handleReport = (postId: string) => {
    if (!userId) {
      toast.error("Log in om te rapporteren");
      return;
    }

    toast.success("Post gerapporteerd voor moderatie");
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "zojuist";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)}m geleden`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}u geleden`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)}d geleden`;

    return date.toLocaleDateString("nl-NL");
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-6 shadow-sm animate-pulse"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`bg-white rounded-2xl p-6 shadow-sm text-center ${className}`}
      >
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">⚠️</span>
        </div>
        <h3 className="font-medium text-gray-900 mb-2">Kon posts niet laden</h3>
        <p className="text-gray-600 text-sm mb-4">{error}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.location.reload()}
          className="border-[#89CFF0] text-[#89CFF0] hover:bg-[#89CFF0] hover:text-white"
        >
          Probeer opnieuw
        </Button>
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div
        className={`bg-white rounded-2xl p-8 shadow-sm text-center ${className}`}
      >
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <MessageCircle className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-medium text-gray-900 mb-4">
          Nog geen posts
        </h3>
        <p className="text-gray-600 mb-6">
          Wees de eerste om iets te delen in deze tribe!
        </p>
        {userId && (
          <Button
            variant="primary"
            className="bg-[#89CFF0] hover:bg-[#89CFF0]/90 text-[#0D1B2A]"
            onClick={() => toast.success("Post composer komt binnenkort!")}
          >
            Maak eerste post
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {posts.map((post, index) => (
        <ErrorBoundary key={post.id}>
          <article
            className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* Post Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#89CFF0] rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {post.authorName?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    {post.authorName || "Anonieme gebruiker"}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {formatTimeAgo(post.created_at)}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleReport(post.id)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  title="Rapporteer post"
                >
                  <MoreHorizontal className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Post Content */}
            <div className="mb-4">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {post.content}
              </p>
            </div>

            {/* Post Image */}
            {post.image_url && (
              <div className="mb-4 rounded-xl overflow-hidden">
                <SmartImage
                  src={post.image_url}
                  alt="Post afbeelding"
                  id={post.id}
                  kind="generic"
                  aspect="16/9"
                  containerClassName="w-full"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 600px"
                  imgClassName="hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}

            {/* Post Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-xl transition-colors ${
                    likedPosts.has(post.id)
                      ? "bg-red-50 text-red-600"
                      : "hover:bg-gray-50 text-gray-600"
                  }`}
                  disabled={!userId}
                >
                  <Heart
                    className={`w-4 h-4 ${likedPosts.has(post.id) ? "fill-current" : ""}`}
                  />
                  <span className="text-sm font-medium">
                    {(post.likes || 0) + (likedPosts.has(post.id) ? 1 : 0)}
                  </span>
                </button>

                <button
                  onClick={() => handleComment(post.id)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-xl hover:bg-gray-50 text-gray-600 transition-colors"
                  disabled={!userId}
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {post.commentsCount || 0}
                  </span>
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleReport(post.id)}
                  className="p-2 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                  title="Rapporteer post"
                >
                  <Flag className="w-4 h-4" />
                </button>

                {userId === post.authorId && (
                  <button
                    onClick={() =>
                      toast.success("Delete functie komt binnenkort!")
                    }
                    className="p-2 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                    title="Verwijder post"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </article>
        </ErrorBoundary>
      ))}
    </div>
  );
};

export default PostsList;
