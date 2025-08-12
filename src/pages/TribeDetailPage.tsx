import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useMemo } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  ArrowLeft, 
  Users, 
  Crown,
  UserPlus,
  UserMinus
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useTribeBySlug, useTribes } from '../hooks/useTribes';
import { JoinButton } from '../components/tribes/JoinButton';
import { PostComposer } from '../components/tribes/PostComposer';
import { PostsList } from '../components/tribes/PostsList';
import { useFitFiUser } from '../hooks/useFitFiUser';
import type { Tribe } from '../services/data/types';
import Button from '../components/ui/Button';
import ImageWithFallback from '../components/ui/ImageWithFallback';
import LoadingFallback from '../components/ui/LoadingFallback';
import { ErrorBoundary } from '../components/ErrorBoundary';
import toast from 'react-hot-toast';

const TribeDetailPage: React.FC = () => {
  const { slug, tribeId } = useParams<{ slug?: string; tribeId?: string }>();
  const { user } = useUser();
  const navigate = useNavigate();
  const { data: fitFiUser } = useFitFiUser(user?.id);
  const { data: tribes } = useTribes();
  
  // Find tribe by slug or tribeId
  const tribe = useMemo(() => {
    if (!tribes) return null;
    if (slug) {
      return tribes.find(t => t.slug === slug);
    }
    if (tribeId) {
      return tribes.find(t => t.id === tribeId);
    }
    return null;
  }, [tribes, slug, tribeId]);

  const { loading: tribesLoading } = useTribes();

  // Redirect if tribe not found
  useEffect(() => {
    if (!tribesLoading && !tribe) {
      toast.error('Tribe niet gevonden');
      navigate('/tribes');
    }
  }, [tribesLoading, tribe, navigate]);

  if (tribesLoading) {
    return <LoadingFallback fullScreen message="Tribe laden..." />;
  }

  if (!tribe) {
    return (
      <div className="min-h-screen bg-[#F6F6F6] flex items-center justify-center">
        <div className="bg-white p-8 rounded-3xl shadow-sm text-center max-w-md">
          <h2 className="text-2xl font-light text-gray-900 mb-4">Tribe niet gevonden</h2>
          <p className="text-gray-600 mb-6">Deze tribe bestaat niet of is niet beschikbaar.</p>
          <div className="space-y-3">
            <Button onClick={() => window.location.reload()} variant="primary">
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
        <link rel="canonical" href={`https://fitfi.app/tribes/${slug || tribeId}`} />
      </Helmet>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link 
            to="/tribes" 
            className="inline-flex items-center text-[#89CFF0] hover:text-[#89CFF0]/80 transition-colors mb-6"
          >
            <ArrowLeft size={20} className="mr-2" />
            Terug naar tribes
          </Link>
        </div>

        {/* Tribe Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{tribe.name}</h1>
            <p className="text-gray-600 mb-4">{tribe.description}</p>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
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
          
          {/* Join Button Integration */}
          <JoinButton 
            tribeId={tribe.id} 
            className="bg-[#89CFF0] hover:bg-[#89CFF0]/90 text-[#0D1B2A]"
            size="lg"
            variant="primary"
          />
        </div>

        {/* Post Composer Integration */}
        <div className="mb-6">
          <PostComposer 
            tribeId={tribe.id}
            className="shadow-sm"
            placeholder={`Deel iets met ${tribe.name}...`}
          />
        </div>

        {/* Posts Feed Integration */}
        <PostsList 
          tribeId={tribe.id} 
          userId={user?.id}
          userId={user?.id}
          showComposer={false}
        />
      </div>
    </div>
  );
};

export default TribeDetailPage;