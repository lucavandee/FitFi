import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Heart, MessageCircle, Share2, Filter, TrendingUp, Sparkles } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { getFeed } from '../services/DataRouter';
import OutfitCard from '../components/outfits/OutfitCard';
import Button from '../components/ui/Button';
import LoadingFallback from '../components/ui/LoadingFallback';
import ErrorBoundary from '../components/ErrorBoundary';

const FeedPage: React.FC = () => {
  const { user } = useUser();
  const [outfits, setOutfits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFeed();
  }, [user?.id]);

  const loadFeed = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const feedData = await getFeed({
        userId: user?.id,
        count: 12,
        archetypes: ['casual_chic', 'urban', 'klassiek']
      });
      
      setOutfits(feedData);
    } catch (err) {
      console.error('Error loading feed:', err);
      setError('Kon feed niet laden');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingFallback fullScreen message="Feed laden..." />;
  }

  return (
    <div className="min-h-screen bg-[#F6F6F6]">
      <Helmet>
        <title>Style Feed - Ontdek Nieuwe Outfits | FitFi</title>
        <meta name="description" content="Ontdek nieuwe outfit inspiratie in je persoonlijke style feed. Swipe, save en shop je favoriete looks." />
      </Helmet>

      <div className="max-w-7xl mx-auto py-12 px-4 md:px-8 lg:px-16">
        {/* Header */}
        <ErrorBoundary>
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-gradient-to-br from-[#89CFF0] to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-4xl font-light text-[#0D1B2A] mb-6">
              Jouw Style Feed
            </h1>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
              Ontdek nieuwe outfit inspiratie speciaal voor jouw stijl
            </p>

            {/* Filter Bar */}
            <div className="flex justify-center space-x-4 mb-8">
              <Button
                variant="outline"
                size="sm"
                icon={<Filter size={16} />}
                iconPosition="left"
                className="border-[#89CFF0] text-[#89CFF0] hover:bg-[#89CFF0] hover:text-white"
              >
                Filter
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={<TrendingUp size={16} />}
                iconPosition="left"
                className="border-gray-300 text-gray-600 hover:bg-gray-50"
              >
                Trending
              </Button>
            </div>
          </div>
        </ErrorBoundary>

        {/* Feed Grid */}
        <ErrorBoundary>
          {error ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">
                Kon feed niet laden
              </h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <Button onClick={loadFeed} variant="primary">
                Probeer opnieuw
              </Button>
            </div>
          ) : outfits.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {outfits.map((outfit, index) => (
                <div
                  key={outfit.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <OutfitCard
                    outfit={{
                      id: outfit.id,
                      title: outfit.title,
                      description: outfit.description,
                      imageUrl: outfit.imageUrl,
                      matchPercentage: 87,
                      archetype: outfit.archetype,
                      tags: outfit.tags
                    }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">
                Nog geen outfits
              </h3>
              <p className="text-gray-600 mb-6">
                Voltooi je stijlquiz om gepersonaliseerde aanbevelingen te krijgen.
              </p>
              <Button as={Link} to="/quiz" variant="primary">
                Start Quiz
              </Button>
            </div>
          )}
        </ErrorBoundary>

        {/* CTA Section */}
        {!user && (
          <ErrorBoundary>
            <div className="mt-16 bg-gradient-to-r from-[#89CFF0] to-blue-500 rounded-3xl shadow-sm overflow-hidden">
              <div className="p-8 md:p-12 text-center">
                <h2 className="text-3xl font-light text-white mb-6">
                  Krijg je persoonlijke feed
                </h2>
                <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
                  Maak een account aan om gepersonaliseerde outfit aanbevelingen te ontvangen.
                </p>
                <Button 
                  as={Link}
                  to="/registreren" 
                  variant="primary"
                  size="lg"
                  className="cta-btn px-8 py-4 text-lg font-medium shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                >
                  Gratis account maken
                </Button>
              </div>
            </div>
          </ErrorBoundary>
        )}
      </div>
    </div>
  );
};

export default FeedPage;