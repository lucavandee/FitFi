import React from "react";
import { useTribePosts } from "@/hooks/useTribePosts";
import { MessageCircle, Heart, Share2, Clock, User } from "lucide-react";
import SmartImage from "@/components/media/SmartImage";
import { stableKey } from "@/utils/key";
import LoadingFallback from "../ui/LoadingFallback";
import Button from "../ui/Button";

interface PostsListProps {
  tribeId: string;
  className?: string;
  showComposer?: boolean;
}

export const PostsList: React.FC<PostsListProps> = ({ 
  tribeId, 
  className = '',
  showComposer = false
}) => {
  const { posts, loading, error } = useTribePosts(tribeId);

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-3xl p-6 animate-pulse">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div className="h-32 bg-gray-200 rounded-2xl"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <MessageCircle className="w-8 h-8 text-red-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Kon posts niet laden
        </h3>
        <p className="text-red-600 mb-4">{error}</p>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          className="border-red-300 text-red-600 hover:bg-red-50"
        >
          Probeer opnieuw
        </Button>
      </div>
    );
  }

  if (!posts?.length) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <MessageCircle className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-medium text-gray-900 mb-4">
          Nog geen posts
        </h3>
        <p className="text-gray-600 mb-6">
          Wees de eerste om iets te delen met deze tribe!
        </p>
        {showComposer && (
          <Button
            variant="primary"
            className="bg-[var(--ff-color-primary-500)] hover:bg-[var(--ff-color-primary-500)]/90 text-[var(--color-text)]"
          >
            Schrijf eerste post
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {posts.map((post) => (
        <article 
          key={stableKey(post)}
          className="bg-white rounded-3xl shadow-sm p-6 hover:shadow-md transition-shadow animate-fade-in"
        >
          {/* Post Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              {/* Author Avatar */}
              <div className="w-10 h-10 rounded-full bg-[var(--ff-color-primary-500)] flex items-center justify-center text-white font-medium">
                {post.authorName?.charAt(0).toUpperCase() || 'U'}
              </div>
              
              {/* Author Info */}
              <div>
                <h4 className="font-medium text-gray-900">
                  {post.authorName ?? `Member ${post.authorId.slice(-4)}`}
                </h4>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Clock size={12} />
                  <time dateTime={post.createdAt}>
                    {new Date(post.createdAt).toLocaleDateString('nl-NL', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </time>
                </div>
              </div>
            </div>
            
            {/* Post Menu */}
            <button className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
              <span className="text-gray-400">⋯</span>
            </button>
          </div>

          {/* Post Content */}
          <div className="mb-4">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {post.content}
            </p>
          </div>

          {/* Post Image */}
          {post.imageUrl && (
            <div className="mb-4 rounded-2xl overflow-hidden">
              <SmartImage
                src={post.imageUrl}
                alt="Post afbeelding"
                id={post.id}
                kind="generic"
                sizes="(max-width: 768px) 100vw, 600px"
                className="w-full h-auto max-h-96 object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}

          {/* Post Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-6">
              {/* Like Button */}
              <button className="flex items-center space-x-2 text-gray-500 hover:text-red-500 transition-colors group">
                <Heart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">{post.likes || 0}</span>
              </button>
              
              {/* Comments Button */}
              <button className="flex items-center space-x-2 text-gray-500 hover:text-[var(--ff-color-primary-500)] transition-colors group">
                <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">{post.commentsCount || 0}</span>
              </button>
              
              {/* Share Button */}
              <button className="flex items-center space-x-2 text-gray-500 hover:text-[var(--ff-color-primary-500)] transition-colors group">
                <Share2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>
            </div>
            
            {/* Engagement Summary */}
            {(post.likes || 0) > 0 && (
              <div className="text-sm text-gray-500">
                {post.likes === 1 ? '1 like' : `${post.likes} likes`}
                {(post.commentsCount || 0) > 0 && (
                  <span> • {post.commentsCount === 1 ? '1 comment' : `${post.commentsCount} comments`}</span>
                )}
              </div>
            )}
          </div>
        </article>
      ))}
    </div>
  );
};