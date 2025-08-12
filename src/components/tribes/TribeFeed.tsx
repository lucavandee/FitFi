import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTribePosts } from '../../hooks/useTribes';
import type { TribePost } from '../../services/data/types';
import PostCard from './PostCard';
import LoadingFallback from '../ui/LoadingFallback';
import { MessageCircle } from 'lucide-react';

interface TribeFeedProps {
  tribeId: string;
  userId?: string;
  className?: string;
}

const TribeFeed: React.FC<TribeFeedProps> = ({ tribeId, userId, className = '' }) => {
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  
  // Use new tribe posts hook
  const {
    data: posts,
    loading: isLoading,
    error,
    source,
    refetch
  } = useTribePosts(tribeId, {
    limit: 10,
    offset: page * 10,
    userId
  });

  // Intersection observer for infinite scroll
  const observerRef = useRef<IntersectionObserver>();
  const lastPostElementRef = useCallback((node: HTMLDivElement) => {
    if (isLoadingMore) return;
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMorePosts();
      }
    });
    
    if (node) observerRef.current.observe(node);
  }, [isLoadingMore, hasMore]);

  const loadMorePosts = async () => {
    if (isLoadingMore || !hasMore) return;
    
    setIsLoadingMore(true);
    
    try {
      // For now, just simulate loading more
      // In a real implementation, this would fetch the next page
      setPage(prev => prev + 1);
      setHasMore(false); // Disable for now
      
      toast.success('Meer posts geladen!');
    } catch (error) {
      console.error('Error loading more posts:', error);
      toast.error('Kon meer posts niet laden');
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handlePostUpdate = (updatedPost: any) => {
    // Handle post updates and refresh data
    console.log('Post updated:', updatedPost);
    refetch();
  };

  if (isLoading) {
    return <LoadingFallback message="Posts laden..." />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageCircle className="w-8 h-8 text-red-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Kon posts niet laden
        </h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={refetch}
          className="text-[#89CFF0] hover:text-[#89CFF0]/80 font-medium"
        >
          Probeer opnieuw
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {posts && posts.length > 0 ? (
        <>
          {posts.map((post, index) => (
            <div
              key={post.id}
              ref={index === posts.length - 1 ? lastPostElementRef : undefined}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <PostCard
                post={post}
                onUpdate={handlePostUpdate}
              />
            </div>
          ))}

          {/* Loading More Indicator */}
          {isLoadingMore && (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-[#89CFF0] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-gray-600 text-sm">Meer posts laden...</p>
            </div>
          )}

          {/* End of Feed */}
          {!hasMore && posts.length > 5 && (
            <div className="text-center py-8">
              <p className="text-gray-500">Je hebt alle posts gezien!</p>
            </div>
          )}
        </>
      ) : (
        /* Empty State */
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-4">
            Nog geen posts
          </h3>
          <p className="text-gray-600">
            Wees de eerste om een post te delen in deze tribe!
          </p>
        </div>
      )}
    </div>
  );
};

export default TribeFeed;