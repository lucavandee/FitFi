import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useUser } from '../../context/UserContext';
import { supabase } from '../../lib/supabase';
import { TribePost } from '../../types/tribes';
import PostCard from './PostCard';
import LoadingFallback from '../ui/LoadingFallback';
import { MessageCircle } from 'lucide-react';

interface TribeFeedProps {
  tribeId: string;
  className?: string;
}

const TribeFeed: React.FC<TribeFeedProps> = ({ tribeId, className = '' }) => {
  const { user } = useUser();
  const [posts, setPosts] = useState<TribePost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const realtimeChannelRef = useRef<any>(null);

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

  useEffect(() => {
    loadInitialPosts();
    setupRealtimeSubscription();

    return () => {
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current);
      }
    };
  }, [tribeId]);

  const loadInitialPosts = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('v_tribe_feed')
        .select('*')
        .eq('tribe_id', tribeId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error loading posts:', error);
        return;
      }

      setPosts(data || []);
      setHasMore((data || []).length === 10);
      setPage(1);
    } catch (error) {
      console.error('Error loading initial posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMorePosts = async () => {
    if (isLoadingMore || !hasMore) return;
    
    setIsLoadingMore(true);
    
    try {
      const offset = page * 10;
      const { data, error } = await supabase
        .from('v_tribe_feed')
        .select('*')
        .eq('tribe_id', tribeId)
        .order('created_at', { ascending: false })
        .range(offset, offset + 9);

      if (error) {
        console.error('Error loading more posts:', error);
        return;
      }

      const newPosts = data || [];
      setPosts(prev => [...prev, ...newPosts]);
      setHasMore(newPosts.length === 10);
      setPage(prev => prev + 1);
    } catch (error) {
      console.error('Error loading more posts:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const setupRealtimeSubscription = () => {
    // Subscribe to new posts
    const postsChannel = supabase
      .channel(`tribe_posts_${tribeId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'tribe_posts',
          filter: `tribe_id=eq.${tribeId}`
        },
        async (payload) => {
          console.log('New post received:', payload);
          
          // Fetch full post data with joins
          const { data: fullPost, error } = await supabase
            .from('v_tribe_feed')
            .select('*')
            .eq('id', payload.new.id)
            .single();

          if (!error && fullPost) {
            setPosts(prev => {
              // Remove any optimistic post and add real post at the top
              const withoutOptimistic = prev.filter(p => !p.isOptimistic);
              return [fullPost, ...withoutOptimistic];
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tribe_posts',
          filter: `tribe_id=eq.${tribeId}`
        },
        async (payload) => {
          console.log('Post updated:', payload);
          
          // Fetch updated post data
          const { data: updatedPost, error } = await supabase
            .from('v_tribe_feed')
            .select('*')
            .eq('id', payload.new.id)
            .single();

          if (!error && updatedPost) {
            setPosts(prev => prev.map(post => 
              post.id === updatedPost.id ? updatedPost : post
            ));
          }
        }
      )
      .subscribe();

    // Subscribe to likes changes
    const likesChannel = supabase
      .channel(`tribe_likes_${tribeId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tribe_likes'
        },
        async (payload) => {
          console.log('Like change received:', payload);
          
          // Update the affected post's like data
          const postId = payload.new?.post_id || payload.old?.post_id;
          if (postId) {
            const { data: updatedPost, error } = await supabase
              .from('v_tribe_feed')
              .select('*')
              .eq('id', postId)
              .single();

            if (!error && updatedPost) {
              setPosts(prev => prev.map(post => 
                post.id === postId ? updatedPost : post
              ));
            }
          }
        }
      )
      .subscribe();

    realtimeChannelRef.current = { postsChannel, likesChannel };
  };

  const handlePostUpdate = (updatedPost: any) => {
    if (updatedPost.replaceOptimistic) {
      // Replace optimistic post with real post
      setPosts(prev => prev.map(post => 
        post.id === updatedPost.replaceOptimistic 
          ? { ...updatedPost, isOptimistic: false }
          : post
      ));
    } else if (updatedPost.removeOptimistic) {
      // Remove failed optimistic post
      setPosts(prev => prev.filter(post => post.id !== updatedPost.removeOptimistic));
    } else if (updatedPost.isOptimistic) {
      // Add optimistic post
      setPosts(prev => [updatedPost, ...prev]);
    } else {
      // Regular post update
      setPosts(prev => prev.map(post => 
        post.id === updatedPost.id ? updatedPost : post
      ));
    }
  };

  if (isLoading) {
    return <LoadingFallback message="Posts laden..." />;
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {posts.length > 0 ? (
        <>
          {posts.map((post, index) => (
            <div
              key={post.id}
              ref={index === posts.length - 1 ? lastPostElementRef : undefined}
              className={`animate-fade-in ${post.isOptimistic ? 'opacity-75' : ''}`}
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