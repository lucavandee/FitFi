import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  RefreshCw, 
  Heart, 
  Share2, 
  ShoppingBag, 
  Star,
  Sparkles,
  User,
  Calendar,
  MapPin,
  Palette,
  HelpCircle
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { getOutfits, getRecommendedProducts } from '../services/DataRouter';
import { Outfit, Product } from '../engine';
import { getSafeUser } from '../utils/userUtils';
import { generateDetailedExplanation, generateEnhancedOutfitExplanation } from '../engine/explainOutfit';
import NovaChat from '../components/ai/NovaChat';
import VirtualTryOnPreview from '../components/ai/VirtualTryOnPreview';
import Popover from '../components/ui/Popover';
import LoadingFallback from '../components/ui/LoadingFallback';

const EnhancedResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useUser();
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOutfit, setSelectedOutfit] = useState<Outfit | null>(null);
  const [showVirtualTryOn, setShowVirtualTryOn] = useState(false);

  // Get onboarding data from navigation state
  const onboardingData = location.state?.onboardingData;

  useEffect(() => {
    const loadRecommendations = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const safeUser = getSafeUser(user);
        
        // Load outfits and products
        const [outfitsData, productsData] = await Promise.all([
          getOutfits(safeUser, { count: 3 }),
          getRecommendedProducts(safeUser, 6)
        ]);

        setOutfits(outfitsData || []);
        setProducts(productsData || []);
      } catch (err) {
        console.error('Error loading recommendations:', err);
        setError('Er ging iets mis bij het laden van je aanbevelingen. Probeer het opnieuw.');
      } finally {
        setIsLoading(false);
      }
    };

    loadRecommendations();
  }, [user]);

  const handleRetakeQuiz = () => {
    navigate('/onboarding');
  };

  const handleSaveOutfit = (outfitId: string) => {
    // TODO: Implement save functionality
    console.log('Saving outfit:', outfitId);
  };

  const handleShareOutfit = (outfitId: string) => {
    // TODO: Implement share functionality
    console.log('Sharing outfit:', outfitId);
  };

  const handleOutfitClick = (outfit: Outfit) => {
    setSelectedOutfit(outfit);
    setShowVirtualTryOn(true);
  };

  const handleOutfitUpdate = (updatedOutfits: Outfit[]) => {
    setOutfits(updatedOutfits);
  };

  const renderOutfitExplanation = (outfit: Outfit) => {
    if (!user) return null;

    return (
      <Popover
        trigger={
          <button className="w-6 h-6 rounded-full bg-[#89CFF0]/20 hover:bg-[#89CFF0]/30 flex items-center justify-center transition-colors">
            <HelpCircle size={14} className="text-[#89CFF0]" />
          </button>
        }
        content={
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-[#89CFF0]" />
              <span className="font-medium text-gray-900">Waarom deze outfit?</span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              {outfit.explanation}
            </p>
            {outfit.novaExplanation && (
              <div className="p-2 bg-[#89CFF0]/10 rounded-lg">
                <p className="text-xs text-gray-700 italic">
                  💬 Nova: "{outfit.novaExplanation}"
                </p>
              </div>
            )}
          </div>
        }
        placement="top"
        maxWidth="max-w-xs"
      />
    );
  };

  if (isLoading) {
    return <LoadingFallback fullScreen message="Je gepersonaliseerde aanbevelingen worden geladen..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="bg-accent text-text-dark p-6 rounded-2xl shadow-lg text-center max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Oeps!</h2>
          <p className="mb-6">{error}</p>
          <Button variant="primary" onClick={() => window.location.reload()}>
            Probeer opnieuw
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-primary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-8">
        {/* Header */}
        <div className="bg-accent text-text-dark p-6 rounded-2xl shadow-lg mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <h1 className="text-3xl font-bold text-secondary mb-2">
                Jouw perfecte stijl
              </h1>
              <p className="text-gray-600">
                Gepersonaliseerde outfits en aanbevelingen, speciaal voor jou samengesteld
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                onClick={handleRetakeQuiz}
                icon={<RefreshCw size={16} />}
                iconPosition="left"
                size="sm"
              >
                Quiz opnieuw
              </Button>
              
              <Button
                as={Link}
                to="/dashboard"
                variant="secondary"
                icon={<User size={16} />}
                iconPosition="left"
                size="sm"
              >
                Dashboard
              </Button>
            </div>
          </div>
        </div>

        {/* Profile Summary */}
        {onboardingData && (
          <div className="bg-accent text-text-dark p-6 rounded-2xl shadow-lg mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Sparkles className="text-secondary mr-2" size={20} />
              Jouw stijlprofiel
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <User className="text-secondary" size={16} />
                <span className="text-sm text-gray-600">Gender:</span>
                <span className="font-medium capitalize">{onboardingData.gender}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Palette className="text-secondary" size={16} />
                <span className="text-sm text-gray-600">Stijl:</span>
                <span className="font-medium">{onboardingData.archetypes?.join(', ')}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Calendar className="text-secondary" size={16} />
                <span className="text-sm text-gray-600">Seizoen:</span>
                <span className="font-medium capitalize">{onboardingData.season}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <MapPin className="text-secondary" size={16} />
                <span className="text-sm text-gray-600">Gelegenheden:</span>
                <span className="font-medium">{onboardingData.occasions?.join(', ')}</span>
              </div>
            </div>
          </div>
        )}

        {/* Outfits Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-secondary mb-6">
            Complete outfits voor jou
          </h2>
          
          {outfits.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {outfits.map((outfit, index) => (
                <div
                  key={outfit.id}
                  className="bg-accent text-text-dark rounded-2xl shadow-lg overflow-hidden animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => handleOutfitClick(outfit)}
                >
                  <div className="relative aspect-[3/4]">
                    <img 
                      src={outfit.imageUrl || 'https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=2'} 
                      alt={outfit.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-secondary text-primary px-3 py-1 rounded-full text-sm font-bold">
                      {outfit.matchPercentage}% Match
                    </div>
                    <div className="absolute top-3 right-3 flex space-x-2">
                      {renderOutfitExplanation(outfit)}
                      <button
                        onClick={() => handleSaveOutfit(outfit.id)}
                        className="w-8 h-8 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                      >
                        <Heart size={16} className="text-gray-700" />
                      </button>
                      <button
                        onClick={() => handleShareOutfit(outfit.id)}
                        className="w-8 h-8 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                      >
                        <Share2 size={16} className="text-gray-700" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{outfit.title}</h3>
                    <p className="text-gray-600 mb-4">{outfit.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {outfit.tags?.slice(0, 3).map((tag, tagIndex) => (
                        <span key={tagIndex} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full"
                      icon={<ShoppingBag size={16} />}
                      iconPosition="left"
                    >
                      Shop deze look
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-accent text-text-dark p-6 rounded-2xl shadow-lg text-center">
              <p className="text-gray-600 mb-4">
                Geen outfits gevonden. Probeer je voorkeuren aan te passen.
              </p>
              <Button variant="secondary" onClick={handleRetakeQuiz}>
                Quiz opnieuw doen
              </Button>
            </div>
          )}
        </div>

        {/* Individual Products Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-secondary mb-6">
            Individuele items voor jou
          </h2>
          
          {products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {products.map((product, index) => (
                <div
                  key={product.id}
                  className="bg-accent text-text-dark rounded-2xl shadow-lg overflow-hidden animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="relative aspect-square">
                    <img 
                      src={product.imageUrl || 'https://images.pexels.com/photos/5935748/pexels-photo-5935748.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2'} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    {product.matchScore && (
                      <>
                        <div className="absolute top-2 left-2 bg-secondary text-primary px-2 py-1 rounded-full text-xs font-bold">
                          <Star size={12} className="inline mr-1" />
                          {Math.round(product.matchScore * 20)}%
                        </div>
                        
                        {/* Enhanced Confidence Badge */}
                        <div className="absolute top-3 right-3">
                          <Popover
                            trigger={
                              <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-[#89CFF0] cursor-pointer hover:bg-white transition-colors">
                                ☑︎ {Math.round(product.matchScore * 20)}%
                              </div>
                            }
                            content={
                              <div className="space-y-3 max-w-xs">
                                <div className="flex items-center space-x-2">
                                  <Sparkles className="w-4 h-4 text-[#89CFF0]" />
                                  <span className="font-medium text-gray-900">Waarom dit werkt</span>
                                </div>
                                <p className="text-sm text-gray-700">
                                  Dit product past perfect bij jouw stijlprofiel en voorkeuren.
                                </p>
                              </div>
                            }
                            placement="bottom"
                          />
                        </div>
                      </>
                      
                    )}
                  </div>
                  
                  <div className="p-3">
                    <h4 className="font-semibold text-sm mb-1 truncate">{product.name}</h4>
                    <p className="text-xs text-gray-600 mb-2">{product.brand}</p>
                    <p className="font-bold text-secondary">€{product.price?.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-accent text-text-dark p-6 rounded-2xl shadow-lg text-center">
              <p className="text-gray-600 mb-4">
                Geen producten gevonden. Probeer je voorkeuren aan te passen.
              </p>
              <Button variant="secondary" onClick={handleRetakeQuiz}>
                Quiz opnieuw doen
              </Button>
            </div>
          )}
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-secondary/20 to-secondary/10 p-6 rounded-2xl shadow-lg text-center">
          <h2 className="text-2xl font-bold text-secondary mb-4">
            Vind je het leuk?
          </h2>
          <p className="text-body mb-6 max-w-2xl mx-auto">
            Maak een account aan om je aanbevelingen op te slaan en nog meer gepersonaliseerde outfits te ontvangen.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              as={Link}
              to="/register" 
              variant="primary"
              size="lg"
            >
              Account aanmaken
            </Button>
            <Button 
              as={Link}
              to="/dashboard" 
              variant="secondary"
              size="lg"
            >
              Naar dashboard
            </Button>
          </div>
        </div>
      </div>
      </div>

      {/* Nova Chat */}
      <NovaChat 
        currentOutfits={outfits}
        onOutfitUpdate={handleOutfitUpdate}
        context="results"
      />

      {/* Virtual Try-On Modal */}
      {showVirtualTryOn && selectedOutfit && user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-medium text-gray-900">Virtual Try-On Preview</h3>
                <button
                  onClick={() => setShowVirtualTryOn(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  ×
                </button>
              </div>
              
              <VirtualTryOnPreview
                outfit={selectedOutfit}
                user={user}
                onInteraction={(interaction) => {
                  console.log('Virtual try-on interaction:', interaction);
                  if (interaction === 'like' || interaction === 'dislike') {
                    // Handle feedback
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
  
  // Helper function to get outfit confidence
  const getOutfitConfidence = (outfit: Outfit): number => {
    const explanation = generateEnhancedOutfitExplanation(
      outfit,
      outfit.archetype,
      outfit.occasion,
      user?.name,
      null // bodyProfile would be passed here
    );
    return explanation.confidencePercent;
  };
  
  // Helper function to render enhanced explanation
  const renderEnhancedExplanation = (outfit: Outfit) => {
    const explanation = generateEnhancedOutfitExplanation(
      outfit,
      outfit.archetype,
      outfit.occasion,
      user?.name,
      null // bodyProfile would be passed here
    );
    
    return (
      <div className="space-y-3">
        <p className="text-sm text-gray-700 leading-relaxed">
          {explanation.text}
        </p>
        
        <div className="space-y-2">
          <div className="text-xs text-gray-600">Confidence breakdown:</div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Seizoen fit:</span>
              <span className="font-medium">{Math.round(explanation.reasoning.seasonFit * 100)}%</span>
            </div>
            <div className="flex justify-between text-xs">
              <span>Kleur harmonie:</span>
              <span className="font-medium">{Math.round(explanation.reasoning.colorHarmony * 100)}%</span>
            </div>
            <div className="flex justify-between text-xs">
              <span>Pasvorm:</span>
              <span className="font-medium">{Math.round(explanation.reasoning.bodyFit * 100)}%</span>
            </div>
            <div className="flex justify-between text-xs">
              <span>Stijl match:</span>
              <span className="font-medium">{Math.round(explanation.reasoning.styleMatch * 100)}%</span>
            </div>
          </div>
        </div>
      </div>
    );
  };
};

export default EnhancedResultsPage;