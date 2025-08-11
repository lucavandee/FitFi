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
import PostComposer from '../components/tribes/PostComposer';
import TribeFeed from '../components/tribes/TribeFeed';
import ImageWithFallback from '../components/ui/ImageWithFallback';
import LoadingFallback from '../components/ui/LoadingFallback';
import { ErrorBoundary } from '../components/ErrorBoundary';
import toast from 'react-hot-toast';

const TribeDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useUser();
  const navigate = useNavigate();
  
  const [tribe, setTribe] = useState<Tribe | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
    } catch (error) {
      console.error('Error loading tribe:', error);
      toast.error('Kon tribe niet laden');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinTribe = async () => {
    if (!user?.id || !tribe?.id) return;

    try {
      const success = await TribesService.joinTribe(tribe.id, user.id);
      if (success) {
        toast.success(`Je bent toegetreden tot ${tribe.name}!`);
        setTribe(prev => prev ? { 
          ...prev, 
          is_member: true, 
          user_role: 'member' as const, 
          member_count: prev.member_count + 1 
        } : null);
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
        setTribe(prev => prev ? { 
          ...prev, 
          is_member: false, 
          member_count: prev.member_count - 1 
        } : null);
      }
    } catch (error) {
      console.error('Error leaving tribe:', error);
      toast.error('Kon tribe niet verlaten');
    }
  };

  const handlePostCreated = (post: any) => {
    // This will be handled by TribeFeed component
    console.log('Post created:', post);
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
            <PostComposer
              tribeId={tribe.id}
              onPostCreated={handlePostCreated}
              className="mb-8"
            />
          </ErrorBoundary>
        )}

        {/* Tribe Feed */}
        <ErrorBoundary>
          <TribeFeed tribeId={tribe.id} />
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default TribeDetailPage;