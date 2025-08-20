import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Heart, Trash2, Share2, Filter } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { listSaved, removeOutfit } from '@/services/saved/savedOutfitsService';
import type { SavedOutfitRecord } from '@/services/saved/savedOutfitsService';
import Button from '../components/ui/Button';
import ImageWithFallback from '../components/ui/ImageWithFallback';
import LoadingFallback from '../components/ui/LoadingFallback';
import { ErrorBoundary } from '../components/ErrorBoundary';
import toast from 'react-hot-toast';

const SavedOutfitsPage: React.FC = () => {
  const { user, isLoading: userLoading } = useUser();
  const [items, setItems] = useState<SavedOutfitRecord[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user?.id) {
      loadSavedOutfits();
    } else if (!userLoading) {
      setLoading(false);
    }
  }, [user?.id, userLoading]);

  const loadSavedOutfits = async () => {
    try {
      setLoading(true);
      setError(null);
      const savedItems = await listSaved();
      setItems(savedItems || []);
    } catch (err) {
      console.error('Error loading saved outfits:', err);
      setError(err instanceof Error ? err.message : 'Kon favorieten niet laden');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveOutfit = async (outfitId: string) => {
    if (deletingIds.has(outfitId)) return;

    setDeletingIds(prev => new Set(prev).add(outfitId));

    try {
      await removeOutfit(outfitId);
      
      // Update local state
      setItems(prev => prev ? prev.filter(item => item.outfit_id !== outfitId) : []);
      
      toast.success('Outfit verwijderd uit favorieten');
    } catch (error) {
      console.error('Error removing outfit:', error);
      toast.error('Kon outfit niet verwijderen');
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(outfitId);
        return newSet;
      });
    }
  };

  const handleShareOutfit = (outfit: any) => {
    const shareText = `Check deze outfit uit: ${outfit.title || 'Mijn favoriete look'} via FitFi!`;
    const shareUrl = `${window.location.origin}/outfits?shared=${outfit.id}`;
    
    if (navigator.share) {
      navigator.share({
        title: outfit.title || 'Mijn favoriete outfit',
        text: shareText,
        url: shareUrl
      });
    } else {
      navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      toast.success('Link gekopieerd naar klembord!');
    }
  };

  if (userLoading || loading) {
    return <LoadingFallback fullScreen message="Favorieten laden..." />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F6F6F6] flex items-center justify-center">
        <div className="bg-white p-8 rounded-3xl shadow-sm text-center max-w-md">
          <div className="w-16 h-16 bg-[#89CFF0]/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-8 h-8 text-[#89CFF0]" />
          </div>
          <h2 className="text-2xl font-light text-gray-900 mb-4">Inloggen vereist</h2>
          <p className="text-gray-600 mb-6">Je moet ingelogd zijn om je favorieten te bekijken.</p>
          <Button as={Link} to="/inloggen" variant="primary" fullWidth>
            Inloggen
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F6F6]">
      <Helmet>
        <title>Mijn Favorieten - Opgeslagen Outfits | FitFi</title>
        <meta name="description" content="Bekijk al je opgeslagen outfit favorieten. Beheer je collectie en vind snel terug wat je mooi vindt." />
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <div className="max-w-7xl mx-auto py-12 px-4 md:px-8 lg:px-16">
        {/* Header */}
        <ErrorBoundary>
          <div className="mb-8">
            <Link 
              to="/dashboard" 
              className="inline-flex items-center text-[#89CFF0] hover:text-[#89CFF0]/80 transition-colors mb-6"
            >
              <ArrowLeft size={20} className="mr-2" />
              Terug naar dashboard
            </Link>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-light text-[#0D1B2A] mb-4">
                  Mijn Favorieten
                </h1>
                <p className="text-xl text-gray-600">
                  {items?.length || 0} opgeslagen outfits
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
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
        </ErrorBoundary>

        {/* Error State */}
        {error && (
          <ErrorBoundary>
            <div className="bg-white rounded-3xl shadow-sm p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">
                Kon favorieten niet laden
              </h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <Button onClick={loadSavedOutfits} variant="primary">
                Probeer opnieuw
              </Button>
            </div>
          </ErrorBoundary>
        )}

        {/* Empty State */}
        {!error && items && items.length === 0 && (
          <ErrorBoundary>
            <div className="bg-white rounded-3xl shadow-sm p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">
                Nog geen favorieten
              </h3>
              <p className="text-gray-600 mb-6">
                Bewaar outfits die je leuk vindt door op het hartje te tikken.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button 
                  as={Link}
                  to="/outfits" 
                  variant="primary"
                  className="bg-[#89CFF0] hover:bg-[#89CFF0]/90 text-[#0D1B2A]"
                >
                  Ontdek outfits
                </Button>
                <Button 
                  as={Link}
                  to="/feed" 
                  variant="outline"
                  className="border-[#89CFF0] text-[#89CFF0] hover:bg-[#89CFF0] hover:text-white"
                >
                  Bekijk feed
                </Button>
              </div>
            </div>
          </ErrorBoundary>
        )}

        {/* Outfits Grid */}
        {!error && items && items.length > 0 && (
          <ErrorBoundary>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {items.map((item) => {
                const outfit = item.outfit_json || {};
                const mainProduct = outfit.products?.[0];
                const isDeleting = deletingIds.has(item.outfit_id);
                
                return (
                  <div
                    key={item.id}
                    className={`bg-white rounded-3xl shadow-sm overflow-hidden hover:shadow-md transition-all ${
                      isDeleting ? 'opacity-50 pointer-events-none' : 'hover:transform hover:scale-105'
                    }`}
                  >
                    {/* Image */}
                    <div className="aspect-[4/5] bg-gray-100 relative">
                      <ImageWithFallback
                        src={mainProduct?.imageUrl || outfit.imageUrl || '/images/fallbacks/outfit.jpg'}
                        alt={outfit.title || 'Opgeslagen outfit'}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                      
                      {/* Match Score */}
                      {outfit.matchScore && (
                        <div className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded-full text-xs font-medium">
                          {Math.round(outfit.matchScore)}% match
                        </div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 mb-2 line-clamp-1">
                        {outfit.title || 'Opgeslagen outfit'}
                      </h3>
                      
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {outfit.why || outfit.description || 'Een van je favoriete looks'}
                      </p>
                      
                      {/* Tags */}
                      {outfit.tags && outfit.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {outfit.tags.slice(0, 2).map((tag: string) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-[#89CFF0]/10 text-[#89CFF0] rounded-full text-xs font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {/* Actions */}
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          {item.created_at && (
                            <>Bewaard {new Date(item.created_at).toLocaleDateString('nl-NL')}</>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleShareOutfit(outfit)}
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                            title="Deel outfit"
                          >
                            <Share2 className="w-4 h-4 text-gray-500" />
                          </button>
                          
                          <button
                            onClick={() => handleRemoveOutfit(item.outfit_id)}
                            disabled={isDeleting}
                            className="p-2 rounded-full hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors disabled:opacity-50"
                            title="Verwijder uit favorieten"
                          >
                            {isDeleting ? (
                              <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ErrorBoundary>
        )}

        {/* Bottom CTA */}
        {items && items.length > 0 && (
          <ErrorBoundary>
            <div className="mt-16 bg-white rounded-3xl shadow-sm p-8 text-center">
              <h2 className="text-2xl font-medium text-[#0D1B2A] mb-4">
                Vind meer outfits die je leuk vindt
              </h2>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Ontdek nog meer gepersonaliseerde aanbevelingen en bouw je perfecte garderobe op.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button 
                  as={Link}
                  to="/outfits" 
                  variant="primary"
                  className="bg-[#89CFF0] hover:bg-[#89CFF0]/90 text-[#0D1B2A]"
                >
                  Ontdek meer outfits
                </Button>
                <Button 
                  as={Link}
                  to="/feed" 
                  variant="outline"
                  className="border-[#89CFF0] text-[#89CFF0] hover:bg-[#89CFF0] hover:text-white"
                >
                  Bekijk style feed
                </Button>
              </div>
            </div>
          </ErrorBoundary>
        )}
      </div>
    </div>
  );
};

export default SavedOutfitsPage;