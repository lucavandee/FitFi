import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Users, Plus, Search, TrendingUp, Star, ArrowRight } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useTribes } from '../hooks/useTribes';
import { useFitFiUser } from '../hooks/useFitFiUser';
import { JoinButton } from '../components/tribes/JoinButton';
import type { Tribe } from '../services/data/types';
import Button from '../components/ui/Button';
import ImageWithFallback from '../components/ui/ImageWithFallback';
import LoadingFallback from '../components/ui/LoadingFallback';
import { ErrorBoundary } from '../components/ErrorBoundary';
import toast from 'react-hot-toast';

const TribesPage: React.FC = () => {
  const { user } = useUser();
  const { data: fitFiUser } = useFitFiUser(user?.id);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArchetype, setSelectedArchetype] = useState<string | undefined>();
  
  // Use new tribes hook
  const { 
    data: tribes, 
    loading: isLoading, 
    error, 
    source,
    cached,
    refetch 
  } = useTribes({
    featured: undefined,
    archetype: selectedArchetype,
    limit: 20
  });


  const filteredTribes = (tribes || []).filter(tribe =>
    tribe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tribe.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Show error state if data service failed
  if (error && source === 'fallback') {
    return (
      <div className="min-h-screen bg-[#F6F6F6] flex items-center justify-center">
        <div className="bg-white p-8 rounded-3xl shadow-sm text-center max-w-md">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-2xl font-light text-gray-900 mb-4">Tribes laden mislukt</h2>
          <p className="text-gray-600 mb-6">
            Er ging iets mis bij het laden van tribes. Probeer het later opnieuw.
          </p>
          <div className="space-y-3">
            <Button onClick={refetch} variant="primary">
              Probeer opnieuw
            </Button>
            <Button as={Link} to="/dashboard" variant="outline">
              Terug naar Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingFallback fullScreen message="Style Tribes laden..." />;
  }

  return (
    <div className="min-h-screen bg-[#F6F6F6]">
      <Helmet>
        <title>Style Tribes - Community voor Stijlliefhebbers | FitFi</title>
        <meta name="description" content="Sluit je aan bij Style Tribes en deel je outfits met gelijkgestemde stijlliefhebbers. Ontdek nieuwe trends en inspiratie." />
        <meta property="og:title" content="Style Tribes - Community voor Stijlliefhebbers" />
        <meta property="og:description" content="Deel je outfits en ontdek nieuwe stijlinspiratie in onze community." />
        <link rel="canonical" href="https://fitfi.app/tribes" />
      </Helmet>

      <div className="max-w-7xl mx-auto py-12 px-4 md:px-8 lg:px-16">
        {/* Hero Section */}
        <ErrorBoundary>
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-gradient-to-br from-[#89CFF0] to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-4xl font-light text-[#0D1B2A] mb-6">
              Style Tribes
            </h1>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
              Sluit je aan bij communities van gelijkgestemde stijlliefhebbers. 
              Deel je outfits, ontdek nieuwe trends en laat je inspireren.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Zoek tribes..."
                  className="w-full px-4 py-3 pl-12 border border-gray-200 bg-white rounded-2xl shadow-sm focus:ring-2 focus:ring-[#89CFF0] focus:border-[#89CFF0] text-gray-900 placeholder-gray-500 transition-all"
                />
                <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
              </div>
            </div>

            {/* Archetype Filter */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {[
                { id: undefined, label: 'Alle' },
                { id: 'klassiek', label: 'Klassiek' },
                { id: 'casual_chic', label: 'Casual Chic' },
                { id: 'streetstyle', label: 'Streetstyle' },
                { id: 'retro', label: 'Retro' },
                { id: 'luxury', label: 'Luxury' }
              ].map((archetype) => (
                <button
                  key={archetype.id || 'all'}
                  onClick={() => setSelectedArchetype(archetype.id)}
                  className={`px-4 py-2 rounded-full transition-colors ${
                    selectedArchetype === archetype.id
                      ? 'bg-[#89CFF0] text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  {archetype.label}
                </button>
              ))}
            </div>

            {/* Data Source Indicator (Development) */}
            {import.meta.env.DEV && (
              <div className="mb-4 text-center">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                  source === 'supabase' ? 'bg-green-100 text-green-800' :
                  source === 'local' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  Data source: {source} {cached ? '(cached)' : ''}
                </span>
              </div>
            )}

            {/* Create Tribe CTA */}
            {user && (
              <Button
                as={Link}
                to="/tribes/create"
                variant="primary"
                icon={<Plus size={20} />}
                iconPosition="left"
                className="bg-[#89CFF0] hover:bg-[#89CFF0]/90 text-[#0D1B2A]"
              >
                Maak je eigen tribe
              </Button>
            )}
          </div>
        </ErrorBoundary>

        {/* Tribes Grid */}
        <ErrorBoundary>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTribes.map((tribe, index) => (
              <div
                key={tribe.id}
                className="bg-white rounded-3xl shadow-sm overflow-hidden hover:shadow-md transition-all hover:transform hover:scale-105 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Cover Image */}
                <div className="relative aspect-video overflow-hidden">
                  <ImageWithFallback
                    src={tribe.cover_img || 'https://images.pexels.com/photos/5935748/pexels-photo-5935748.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&dpr=2'}
                    alt={`${tribe.name} tribe cover`}
                    className="w-full h-full object-cover"
                    componentName="TribesPage"
                  />
                  
                  {/* Member count overlay */}
                  <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                    <Users size={14} className="inline mr-1" />
                    {tribe.member_count}
                  </div>

                  {/* Membership status */}
                  {tribe.is_member && (
                    <div className="absolute top-4 left-4 bg-[#89CFF0] text-white px-3 py-1 rounded-full text-sm font-medium">
                      ✓ Member
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-medium text-[#0D1B2A] mb-2">
                        {tribe.name}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {tribe.description}
                      </p>
                    </div>
                    
                    {tribe.user_role === 'owner' && (
                      <div className="ml-3">
                        <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
                          <Star size={14} className="text-yellow-600" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Users size={14} />
                        <span>{tribe.member_count} members</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <TrendingUp size={14} />
                        <span>Actief</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-3">
                    <Button
                      as={Link}
                      to={`/tribes/${tribe.slug}`}
                      variant="primary"
                      size="sm"
                      className="flex-1 bg-[#89CFF0] hover:bg-[#89CFF0]/90 text-[#0D1B2A]"
                      icon={<ArrowRight size={16} />}
                      iconPosition="right"
                    >
                      Bekijk tribe
                    </Button>
                    
                    {!tribe.is_member && user && (
                      <Button
                        as="div"
                        variant="outline"
                        size="sm"
                        className="border-[#89CFF0] text-[#89CFF0] hover:bg-[#89CFF0] hover:text-white"
                      >
                        <JoinButton 
                          tribeId={tribe.id}
                          size="sm"
                          variant="outline"
                          className="border-none bg-transparent text-inherit hover:bg-transparent"
                        />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ErrorBoundary>

        {/* Empty State */}
        {filteredTribes.length === 0 && !isLoading && (
          <ErrorBoundary>
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">
                {searchQuery ? 'Geen tribes gevonden' : 'Nog geen tribes'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery 
                  ? 'Probeer een andere zoekterm of maak je eigen tribe.'
                  : 'Wees de eerste om een style tribe te maken!'
                }
              </p>
              {user && (
                <Button
                  as={Link}
                  to="/tribes/create"
                  variant="primary"
                  icon={<Plus size={20} />}
                  iconPosition="left"
                  className="bg-[#89CFF0] hover:bg-[#89CFF0]/90 text-[#0D1B2A]"
                >
                  Maak eerste tribe
                </Button>
              )}
            </div>
          </ErrorBoundary>
        )}

        {/* CTA Section */}
        {!user && (
          <ErrorBoundary>
            <div className="mt-16 bg-gradient-to-r from-[#89CFF0] to-blue-500 rounded-3xl shadow-sm overflow-hidden">
              <div className="p-8 md:p-12 text-center">
                <h2 className="text-3xl font-light text-white mb-6">
                  Sluit je aan bij de community
                </h2>
                <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
                  Maak een account aan om tribes te joinen, outfits te delen en deel uit te maken van onze stijlcommunity.
                </p>
                <Button 
                  as={Link}
                  to="/registreren" 
                  variant="primary"
                  size="lg"
                  icon={<ArrowRight size={20} />}
                  iconPosition="right"
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

export default TribesPage;