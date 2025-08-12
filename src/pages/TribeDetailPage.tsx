import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  ArrowLeft, 
  Users, 
  Crown,
  UserPlus,
  UserMinus
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useTribeBySlug, useTribePosts } from '../hooks/useTribes';
import type { Tribe } from '../services/data/types';
import Button from '../components/ui/Button';
import PostComposer from '../components/tribes/PostComposer';
import PostCard from '../components/tribes/PostCard';
import ImageWithFallback from '../components/ui/ImageWithFallback';
import LoadingFallback from '../components/ui/LoadingFallback';
import { ErrorBoundary } from '../components/ErrorBoundary';
import toast from 'react-hot-toast';

const TribeDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useUser();
  const navigate = useNavigate();
  
  // Use new tribes hooks
  const { 
    tribe, 
    loading: tribeLoading, 
    error: tribeError,
    source: tribeSource,
    refetch: refetchTribe 
  } = useTribeBySlug(slug || '', user?.id);
  
  const {
    data: posts,
    loading: postsLoading,
    error: postsError,
    source: postsSource,
    refetch: refetchPosts
  } = useTribePosts(tribe?.id || '', {
    limit: 20,
    userId: user?.id,
    enabled: !!tribe?.id
  });

  // Redirect if tribe not found
  useEffect(() => {
    if (!tribeLoading && !tribe && !tribeError) {
      toast.error('Tribe niet gevonden');
      navigate('/tribes');
    }
  }, [tribeLoading, tribe, tribeError, navigate]);

  const handleJoinTribe = async () => {
    if (!user?.id || !tribe?.id) return;

    // Mock join functionality
    toast.success(`Je bent toegetreden tot ${tribe.name}!`);
    refetchTribe(); // Refresh tribe data
  };

  const handleLeaveTribe = async () => {
    if (!user?.id || !tribe?.id) return;

    // Mock leave functionality
    toast.success(`Je hebt ${tribe.name} verlaten`);
    refetchTribe(); // Refresh tribe data
  };

  const handlePostCreated = (post: any) => {
    // Refresh posts after creating new post
    console.log('Post created:', post);
    refetchPosts();
  };

  const handlePostUpdate = (updatedPost: any) => {
    // Handle post updates (likes, comments, etc.)
    console.log('Post updated:', updatedPost);
    refetchPosts();
  };

  if (tribeLoading) {
    return <LoadingFallback fullScreen message="Tribe laden..." />;
  }

  if (!tribe) {
    return (
      <div className="min-h-screen bg-[#F6F6F6] flex items-center justify-center">
        <div className="bg-white p-8 rounded-3xl shadow-sm text-center max-w-md">
          <h2 className="text-2xl font-light text-gray-900 mb-4">Tribe niet gevonden</h2>
          <p className="text-gray-600 mb-6">Deze tribe bestaat niet of is niet beschikbaar.</p>
          <div className="space-y-3">
            <Button onClick={refetchTribe} variant="primary">
              Probeer opnieuw
            </Button>
            <Button as={Link} to="/tribes" variant="outline">
              Terug naar Tribes
            </Button>
          </div>
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
          
          {/* Data Source Indicator (Development) */}
          {import.meta.env.DEV && (
            <div className="mb-4">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                tribeSource === 'supabase' ? 'bg-green-100 text-green-800' :
                tribeSource === 'local' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                Tribe data: {tribeSource} | Posts: {postsSource}
              </span>
            </div>
          )}
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
            <PostComposer
              tribeId={tribe.id}
              onPostCreated={handlePostCreated}
              className="mb-8"
            />
          </ErrorBoundary>
        )}

        {/* Tribe Feed */}
        <ErrorBoundary>
          <div className="space-y-6">
            {postsLoading ? (
              <div className="space-y-4">
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
            ) : posts && posts.length > 0 ? (
              posts.map((post, index) => (
                <div
                  key={post.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <PostCard
                    post={post}
                    onUpdate={handlePostUpdate}
                  />
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8 text-gray-400" />
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
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default TribeDetailPage;