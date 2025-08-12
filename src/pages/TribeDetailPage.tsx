import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  ArrowLeft, 
  Users, 
  Crown,
  UserPlus,
  UserMinus,
  Trophy,
  Target
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useTribeBySlug, useTribes } from '../hooks/useTribes';
import { useTribeChallenges, useChallengeSubmissions, useCreateChallengeSubmission } from '../hooks/useTribeChallenges';
import { JoinButton } from '../components/tribes/JoinButton';
import { PostComposer } from '../components/tribes/PostComposer';
import { PostsList } from '../components/tribes/PostsList';
import { ChallengeCard } from '../components/Tribes/ChallengeCard';
import { ChallengeDetail } from '../components/Tribes/ChallengeDetail';
import { SubmissionsList } from '../components/Tribes/SubmissionsList';
import { useFitFiUser } from '../hooks/useFitFiUser';
import type { Tribe, TribeChallenge } from '../services/data/types';
import Button from '../components/ui/Button';
import ImageWithFallback from '../components/ui/ImageWithFallback';
import LoadingFallback from '../components/ui/LoadingFallback';
import { ErrorBoundary } from '../components/ErrorBoundary';
import toast from 'react-hot-toast';

// Helper component for challenge section
const ChallengeSection: React.FC<{ challenge: TribeChallenge; userId?: string }> = ({ challenge, userId }) => {
  const { data: subs, loading: subsLoading } = useChallengeSubmissions(challenge.id);
  const createSub = useCreateChallengeSubmission();

  async function onSubmit(payload: { content?: string; imageUrl?: string; linkUrl?: string }) {
    if (!userId) {
      toast.error('Log in om deel te nemen');
      return;
    }

    try {
      await createSub.mutateAsync({
        id: crypto.randomUUID(),
        tribeId: challenge.tribeId,
        challengeId: challenge.id,
        userId: userId,
        userName: undefined, // Will be filled by backend
        createdAt: new Date().toISOString(),
        score: undefined,
        isWinner: false,
        submissionType: payload.imageUrl && payload.linkUrl ? 'combo' : 
                       payload.imageUrl ? 'image' : 
                       payload.linkUrl ? 'link' : 'text',
        ...payload,
      });
      
      toast.success('Challenge submission succesvol! 🎉');
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Submission mislukt. Probeer opnieuw.');
    }
  }

  return (
    <div className="mt-8 space-y-6">
      <ChallengeDetail challenge={challenge} onSubmit={onSubmit} canSubmit={!!userId} />
      <SubmissionsList subs={subs ?? null} loading={subsLoading} />
    </div>
  );
};
const TribeDetailPage: React.FC = () => {
  const { slug, tribeId } = useParams<{ slug?: string; tribeId?: string }>();
  const { user, status } = useUser();
  const navigate = useNavigate();
  const { data: fitFiUser } = useFitFiUser(user?.id);
  const { data: tribes } = useTribes();
  
  // Challenges state
  const { data: challenges, loading: challengesLoading } = useTribeChallenges(
    tribes?.find(t => t.slug === slug || t.id === tribeId)?.id
  );
  const [activeChallengeId, setActiveChallengeId] = useState<string | null>(null);
  const activeChallenge = useMemo<TribeChallenge | null>(
    () => challenges?.find(c => c.id === activeChallengeId) ?? null,
    [challenges, activeChallengeId]
  );
  
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
            userId={user?.id}
            className="bg-[#89CFF0] hover:bg-[#89CFF0]/90 text-[#0D1B2A]"
            size="lg"
            variant="primary"
          />
        </div>

        {/* Challenges Section */}
        <ErrorBoundary>
          <div className="mt-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#89CFF0] to-blue-500 rounded-full flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-medium text-gray-900">Tribe Challenges</h2>
                  <p className="text-gray-600">Verdien punten en toon je stijl</p>
                </div>
              </div>
              
              {challenges && challenges.length > 0 && (
                <div className="text-sm text-gray-600">
                  {challenges.filter(c => c.status === 'open').length} actieve challenges
                </div>
              )}
            </div>

            {challengesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                    <div className="h-32 bg-gray-200 rounded-xl mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : challenges && challenges.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {challenges.map((challenge, index) => (
                  <div
                    key={challenge.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <ChallengeCard 
                      c={challenge} 
                      onOpen={setActiveChallengeId}
                      className="hover:transform hover:scale-105 transition-all"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Target className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-4">
                  Nog geen challenges
                </h3>
                <p className="text-gray-600 mb-6">
                  Deze tribe heeft nog geen actieve challenges. Check later terug!
                </p>
              </div>
            )}
          </div>
        </ErrorBoundary>

        {/* Active Challenge Detail */}
        {activeChallenge && (
          <ErrorBoundary>
            <div className="mt-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-medium text-gray-900">Challenge Details</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveChallengeId(null)}
                  className="text-gray-600 hover:bg-gray-100"
                >
                  Sluiten
                </Button>
              </div>
              
              <ChallengeSection challenge={activeChallenge} userId={user?.id} />
            </div>
          </ErrorBoundary>
        )}

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
          showComposer={false}
        />
      </div>
    </div>
  );
};

export default TribeDetailPage;