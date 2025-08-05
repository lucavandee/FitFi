import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  ArrowLeft, 
  Users, 
  Plus, 
  Heart, 
  MessageCircle, 
  Send, 
  MoreHorizontal,
  Star,
  Crown,
  UserPlus,
  UserMinus
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { TribesService } from '../services/tribesService';
import { Tribe, TribePost, CreatePostData } from '../types/tribes';
import Button from '../components/ui/Button';
import ImageWithFallback from '../components/ui/ImageWithFallback';
import LoadingFallback from '../components/ui/LoadingFallback';
import { ErrorBoundary } from '../components/ErrorBoundary';
import toast from 'react-hot-toast';

const TribeDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useUser();
  const navigate = useNavigate();
  
  const [tribe, setTribe] = useState<Tribe | null>(null);
  const [posts, setPosts] = useState<TribePost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [newPostContent, setNewPostContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});
  const [newComment, setNewComment] = useState<Record<string, string>>({});

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
    if (slug) {
      loadTribe();
    }
  }, [slug, user?.id]);

  const loadTribe = async () => {
    if (!slug) return;

    try {
      setIsLoading(true);
      const tribeData = await TribesService.getTribeBySlug(slug, user?.id);
      
      if (!tribeData) {
        toast.error('Tribe niet gevonden');
        navigate('/tribes');
        return;
      }

      setTribe(tribeData);
      await loadPosts(true); // Reset posts
    } catch (error) {
      console.error('Error loading tribe:', error);
      toast.error('Kon tribe niet laden');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPosts = async (reset: boolean = false) => {
    if (!tribe?.id) return;

    try {
      if (reset) {
        setPage(0);
        setPosts([]);
      }

      const currentPage = reset ? 0 : page;
      const postsData = await TribesService.getTribePosts(tribe.id, currentPage, 10, user?.id);
      
      if (reset) {
        setPosts(postsData);
      } else {
        setPosts(prev => [...prev, ...postsData]);
      }

      setHasMore(postsData.length === 10);
      if (!reset) {
        setPage(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error loading posts:', error);
      toast.error('Kon posts niet laden');
    }
  };

  const loadMorePosts = async () => {
    if (isLoadingMore || !hasMore) return;
    
    setIsLoadingMore(true);
    await loadPosts();
    setIsLoadingMore(false);
  };

  const handleJoinTribe = async () => {
    if (!user?.id || !tribe?.id) return;

    try {
      const success = await TribesService.joinTribe(tribe.id, user.id);
      if (success) {
        toast.success(`Je bent toegetreden tot ${tribe.name}!`);
        setTribe(prev => prev ? { ...prev, is_member: true, user_role: 'member', member_count: prev.member_count + 1 } : null);
      }
    } catch (error) {
      console.error('Error joining tribe:', error);
      toast.error('Kon niet toetreden tot tribe');
    }
  };

  const handleLeaveTribe = async () => {
    if (!user?.id || !tribe?.id) return;

    try {
      const success = await TribesService.leaveTribe(tribe.id, user.id);
      if (success) {
        toast.success(`Je hebt ${tribe.name} verlaten`);
        setTribe(prev => prev ? { ...prev, is_member: false, user_role: undefined, member_count: prev.member_count - 1 } : null);
      }
    } catch (error) {
      console.error('Error leaving tribe:', error);
      toast.error('Kon tribe niet verlaten');
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id || !tribe?.id || !newPostContent.trim()) return;

    try {
      setIsPosting(true);
      
      const postData: CreatePostData = {
        tribe_id: tribe.id,
        content: newPostContent.trim()
      };

      const newPost = await TribesService.createPost(postData, user.id);
      
      if (newPost) {
        setPosts(prev => [newPost, ...prev]);
        setNewPostContent('');
        toast.success('Post geplaatst!');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Kon post niet plaatsen');
    } finally {
      setIsPosting(false);
    }
  };

  const handleToggleLike = async (postId: string) => {
    if (!user?.id) return;

    try {
      const isLiked = await TribesService.togglePostLike(postId, user.id);
      
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              is_liked: isLiked,
              likes_count: isLiked ? post.likes_count + 1 : post.likes_count - 1
            }
          : post
      ));
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Kon like niet verwerken');
    }
  };

  const handleAddComment = async (postId: string) => {
    if (!user?.id || !newComment[postId]?.trim()) return;

    try {
      const comment = await TribesService.addComment(postId, newComment[postId].trim(), user.id);
      
      if (comment) {
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                comments_count: post.comments_count + 1,
                recent_comments: [comment, ...(post.recent_comments || [])].slice(0, 3)
              }
            : post
        ));
        
        setNewComment(prev => ({ ...prev, [postId]: '' }));
        toast.success('Comment toegevoegd!');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Kon comment niet toevoegen');
    }
  };

  const toggleComments = (postId: string) => {
    setShowComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  if (isLoading) {
    return <LoadingFallback fullScreen message="Tribe laden..." />;
  }

  if (!tribe) {
    return (
      <div className="min-h-screen bg-[#F6F6F6] flex items-center justify-center">
        <div className="bg-white p-8 rounded-3xl shadow-sm text-center max-w-md">
          <h2 className="text-2xl font-light text-gray-900 mb-4">Tribe niet gevonden</h2>
          <p className="text-gray-600 mb-6">Deze tribe bestaat niet of is niet beschikbaar.</p>
          <Button as={Link} to="/tribes" variant="primary">
            Terug naar Tribes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F6F6]">
      <Helmet>
        <title>{tribe.name} - Style Tribe | FitFi</title>
        <meta name="description" content={tribe.description} />
        <meta property="og:title" content={`${tribe.name} - Style Tribe`} />
        <meta property="og:description" content={tribe.description} />
        <meta property="og:image" content={tribe.cover_img} />
        <link rel="canonical" href={`https://fitfi.app/tribes/${tribe.slug}`} />
      </Helmet>

      <div className="max-w-4xl mx-auto py-8 px-4 md:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/tribes" 
            className="inline-flex items-center text-[#89CFF0] hover:text-[#89CFF0]/80 transition-colors mb-6"
          >
            <ArrowLeft size={20} className="mr-2" />
            Terug naar tribes
          </Link>
        </div>

        {/* Tribe Header */}
        <ErrorBoundary>
          <div className="bg-white rounded-3xl shadow-sm overflow-hidden mb-8">
            {/* Cover Image */}
            <div className="relative aspect-[3/1] overflow-hidden">
              <ImageWithFallback
                src={tribe.cover_img || 'https://images.pexels.com/photos/5935748/pexels-photo-5935748.jpeg?auto=compress&cs=tinysrgb&w=1200&h=400&dpr=2'}
                alt={`${tribe.name} cover`}
                className="w-full h-full object-cover"
                componentName="TribeDetailPage"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              
              {/* Tribe info overlay */}
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-end justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">{tribe.name}</h1>
                    <p className="text-white/90 mb-4">{tribe.description}</p>
                    <div className="flex items-center space-x-4 text-white/80 text-sm">
                      <div className="flex items-center space-x-1">
                        <Users size={16} />
                        <span>{tribe.member_count} members</span>
                      </div>
                      {tribe.user_role === 'owner' && (
                        <div className="flex items-center space-x-1">
                          <Crown size={16} />
                          <span>Owner</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Join/Leave Button */}
                  {user && (
                    <div>
                      {tribe.is_member ? (
                        <Button
                          onClick={handleLeaveTribe}
                          variant="outline"
                          className="border-white/30 text-white hover:bg-white/10"
                          icon={<UserMinus size={16} />}
                          iconPosition="left"
                        >
                          Verlaat tribe
                        </Button>
                      ) : (
                        <Button
                          onClick={handleJoinTribe}
                          variant="primary"
                          className="bg-[#89CFF0] hover:bg-[#89CFF0]/90 text-[#0D1B2A]"
                          icon={<UserPlus size={16} />}
                          iconPosition="left"
                        >
                          Join tribe
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </ErrorBoundary>

        {/* Post Composer */}
        {user && tribe.is_member && (
          <ErrorBoundary>
            <div className="bg-white rounded-3xl shadow-sm p-6 mb-8">
              <form onSubmit={handleCreatePost}>
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-full bg-[#89CFF0] flex items-center justify-center text-white font-medium">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  
                  <div className="flex-1">
                    <textarea
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      placeholder={`Deel je stijl met ${tribe.name}...`}
                      className="w-full p-4 border border-gray-200 rounded-2xl resize-none focus:ring-2 focus:ring-[#89CFF0] focus:border-[#89CFF0] transition-colors"
                      rows={3}
                      maxLength={500}
                    />
                    
                    <div className="flex items-center justify-between mt-3">
                      <div className="text-sm text-gray-500">
                        {newPostContent.length}/500 karakters
                      </div>
                      
                      <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                        disabled={!newPostContent.trim() || isPosting}
                        icon={<Send size={16} />}
                        iconPosition="left"
                        className="bg-[#89CFF0] hover:bg-[#89CFF0]/90 text-[#0D1B2A]"
                      >
                        {isPosting ? 'Plaatsen...' : 'Post'}
                      </Button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </ErrorBoundary>
        )}

        {/* Posts Feed */}
        <ErrorBoundary>
          <div className="space-y-6">
            {posts.map((post, index) => (
              <div
                key={post.id}
                ref={index === posts.length - 1 ? lastPostElementRef : undefined}
                className="bg-white rounded-3xl shadow-sm p-6 animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Post Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-[#89CFF0] flex items-center justify-center text-white font-medium">
                      {post.user_profile?.full_name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {post.user_profile?.full_name || 'Anonymous'}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {new Date(post.created_at).toLocaleDateString('nl-NL', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  
                  <button className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
                    <MoreHorizontal size={16} className="text-gray-400" />
                  </button>
                </div>

                {/* Post Content */}
                <div className="mb-4">
                  <p className="text-gray-700 leading-relaxed">{post.content}</p>
                </div>

                {/* Post Image */}
                {post.image_url && (
                  <div className="mb-4 rounded-2xl overflow-hidden">
                    <ImageWithFallback
                      src={post.image_url}
                      alt="Post afbeelding"
                      className="w-full h-auto"
                      componentName="TribeDetailPage"
                    />
                  </div>
                )}

                {/* Outfit Preview */}
                {post.outfit && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-2xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-16 h-20 rounded-lg overflow-hidden">
                        <ImageWithFallback
                          src={post.outfit.image_url || 'https://images.pexels.com/photos/5935748/pexels-photo-5935748.jpeg?auto=compress&cs=tinysrgb&w=200&h=300&dpr=2'}
                          alt={post.outfit.title}
                          className="w-full h-full object-cover"
                          componentName="TribeDetailPage"
                        />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900">{post.outfit.title}</h5>
                        <p className="text-sm text-gray-600">{post.outfit.match_percentage}% match</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Post Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-6">
                    <button
                      onClick={() => handleToggleLike(post.id)}
                      className={`flex items-center space-x-2 transition-colors ${
                        post.is_liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                      }`}
                    >
                      <Heart size={18} className={post.is_liked ? 'fill-current' : ''} />
                      <span className="text-sm font-medium">{post.likes_count}</span>
                    </button>
                    
                    <button
                      onClick={() => toggleComments(post.id)}
                      className="flex items-center space-x-2 text-gray-500 hover:text-[#89CFF0] transition-colors"
                    >
                      <MessageCircle size={18} />
                      <span className="text-sm font-medium">{post.comments_count}</span>
                    </button>
                  </div>
                </div>

                {/* Comments Section */}
                {showComments[post.id] && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    {/* Recent Comments */}
                    {post.recent_comments && post.recent_comments.length > 0 && (
                      <div className="space-y-3 mb-4">
                        {post.recent_comments.map((comment) => (
                          <div key={comment.id} className="flex items-start space-x-3">
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-sm font-medium">
                              {comment.user_profile?.full_name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="flex-1">
                              <div className="bg-gray-50 rounded-2xl px-4 py-2">
                                <p className="font-medium text-gray-900 text-sm">
                                  {comment.user_profile?.full_name || 'Anonymous'}
                                </p>
                                <p className="text-gray-700 text-sm">{comment.content}</p>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(comment.created_at).toLocaleDateString('nl-NL')}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Comment */}
                    {user && tribe.is_member && (
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-[#89CFF0] flex items-center justify-center text-white text-sm font-medium">
                          {user.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 flex space-x-2">
                          <input
                            type="text"
                            value={newComment[post.id] || ''}
                            onChange={(e) => setNewComment(prev => ({ ...prev, [post.id]: e.target.value }))}
                            placeholder="Schrijf een comment..."
                            className="flex-1 px-4 py-2 border border-gray-200 rounded-full focus:ring-2 focus:ring-[#89CFF0] focus:border-[#89CFF0] transition-colors"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleAddComment(post.id);
                              }
                            }}
                          />
                          <Button
                            onClick={() => handleAddComment(post.id)}
                            variant="primary"
                            size="sm"
                            disabled={!newComment[post.id]?.trim()}
                            className="bg-[#89CFF0] hover:bg-[#89CFF0]/90 text-[#0D1B2A] rounded-full"
                          >
                            <Send size={14} />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Loading More */}
            {isLoadingMore && (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-[#89CFF0] border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            )}

            {/* End of Feed */}
            {!hasMore && posts.length > 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">Je hebt alle posts gezien!</p>
              </div>
            )}

            {/* Empty State */}
            {posts.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MessageCircle className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-4">
                  Nog geen posts
                </h3>
                <p className="text-gray-600 mb-6">
                  Wees de eerste om een post te delen in deze tribe!
                </p>
                {user && tribe.is_member && (
                  <Button
                    onClick={() => document.querySelector('textarea')?.focus()}
                    variant="primary"
                    icon={<Plus size={20} />}
                    iconPosition="left"
                    className="bg-[#89CFF0] hover:bg-[#89CFF0]/90 text-[#0D1B2A]"
                  >
                    Maak eerste post
                  </Button>
                )}
              </div>
            )}
          </div>
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default TribeDetailPage;