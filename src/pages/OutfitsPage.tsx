import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader, Heart, Share2, Filter } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useOutfits } from '../hooks/useOutfits';
import { OutfitItem } from '../types/outfit';
import Button from '../components/ui/Button';
import LoadingFallback from '../components/ui/LoadingFallback';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';

interface OutfitCardProps {
  item: OutfitItem;
}

const OutfitCard: React.FC<OutfitCardProps> = ({ item }) => (
  <div className="group relative rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 bg-white overflow-hidden">
    <div className="aspect-[3/4] overflow-hidden">
      <img 
        src={item.image} 
        alt={item.title} 
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
      />
    </div>
    
    <div className="p-4 space-y-2">
      <h3 className="font-medium text-gray-900 text-sm leading-tight">{item.title}</h3>
      <p className="text-xs text-gray-500">{item.brand}</p>
      <p className="text-lg font-bold text-[#89CFF0]">€{item.price.toFixed(2)}</p>
      
      <div className="flex flex-wrap gap-1 mb-3">
        {item.tags.map((tag) => (
          <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
            {tag}
          </span>
        ))}
      </div>
      
      <div className="flex space-x-2">
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 bg-[#89CFF0] text-[#0D1B2A] text-center py-2 rounded-lg font-medium hover:bg-[#89CFF0]/90 transition-colors text-sm"
        >
          Bekijk Product
        </a>
        <button className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors">
          <Heart size={16} className="text-gray-600" />
        </button>
      </div>
    </div>
    
    <div className="absolute inset-0 ring-2 ring-transparent group-hover:ring-[#89CFF0]/30 rounded-xl transition-all pointer-events-none" />
  </div>
);

const OutfitsPage: React.FC = () => {
  const { user } = useUser();
  
  // Determine style key based on user preferences or default
  const getStyleKey = () => {
    if (!user?.stylePreferences) return 'minimalistisch';
    
    const preferences = user.stylePreferences;
    const maxPref = Math.max(...Object.values(preferences));
    const primaryStyle = Object.entries(preferences).find(([_, value]) => value === maxPref)?.[0];
    
    // Map internal style names to outfit style keys
    const styleMapping: Record<string, string> = {
      'minimalist': 'minimalistisch',
      'casual': 'casual',
      'formal': 'klassiek',
      'sporty': 'sportief',
      'vintage': 'vintage'
    };
    
    return styleMapping[primaryStyle || 'minimalist'] || 'minimalistisch';
  };
  
  const styleKey = getStyleKey();
  const { data, isLoading, error, refetch } = useOutfits(styleKey);

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F6F6F6] flex items-center justify-center">
        <div className="bg-white p-8 rounded-3xl shadow-sm text-center max-w-md">
          <h2 className="text-2xl font-light text-gray-900 mb-4">Inloggen vereist</h2>
          <p className="text-gray-600 mb-6">Je moet ingelogd zijn om outfits te bekijken.</p>
          <Button as={Link} to="/inloggen" variant="primary" fullWidth>
            Inloggen
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F6F6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/results" 
            className="inline-flex items-center text-[#89CFF0] hover:text-[#89CFF0]/80 transition-colors mb-6"
          >
            <ArrowLeft size={20} className="mr-2" />
            Terug naar resultaten
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-light text-gray-900 mb-2">
                Aanbevolen Outfits
              </h1>
              <p className="text-gray-600">
                Gepersonaliseerde outfit aanbevelingen voor jouw {styleKey} stijl
              </p>
            </div>
            
            <div className="flex items-center space-x-3 mt-4 md:mt-0">
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
                icon={<Share2 size={16} />}
                iconPosition="left"
                className="border-gray-300 text-gray-600 hover:bg-gray-50"
              >
                Delen
              </Button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader className="animate-spin w-8 h-8 text-[#89CFF0] mx-auto mb-4" />
              <p className="text-gray-600">Outfits laden...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-20">
            <p className="text-red-600 mb-4">Fout bij laden van outfits: {error.message}</p>
            <Button variant="outline" onClick={() => refetch()}>
              Probeer opnieuw
            </Button>
          </div>
        )}

        {/* Outfits Grid */}
        {data && data.items && data.items.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data.items.map((item: OutfitItem) => (
              <OutfitCard key={item.id} item={item} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {data && (!data.items || data.items.length === 0) && (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Geen outfits gevonden
            </h3>
            <p className="text-gray-600 mb-6">
              Er zijn momenteel geen outfits beschikbaar voor jouw stijl.
            </p>
            <Button 
              as={Link} 
              to="/quiz" 
              variant="primary"
              className="bg-[#89CFF0] hover:bg-[#89CFF0]/90 text-[#0D1B2A]"
            >
              Quiz opnieuw doen
            </Button>
          </div>
        )}

        {/* Bottom CTA */}
        {data && data.items && data.items.length > 0 && (
          <div className="mt-12 text-center">
            <div className="bg-white rounded-3xl shadow-sm p-8">
              <h2 className="text-2xl font-medium text-gray-900 mb-4">
                Vind je het leuk?
              </h2>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Ontdek nog meer gepersonaliseerde aanbevelingen en bouw je perfecte garderobe op.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button 
                  as={Link}
                  to="/dashboard" 
                  variant="primary"
                  className="bg-[#89CFF0] hover:bg-[#89CFF0]/90 text-[#0D1B2A]"
                >
                  Ga naar Dashboard
                </Button>
                <Button 
                  as={Link}
                  to="/quiz" 
                  variant="outline"
                  className="border-[#89CFF0] text-[#89CFF0] hover:bg-[#89CFF0] hover:text-white"
                >
                  Quiz opnieuw doen
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OutfitsPage;