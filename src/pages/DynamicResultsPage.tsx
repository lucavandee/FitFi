import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, Star, Brain, Share2, Heart, ShoppingBag, Target, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useUser } from '../context/UserContext';
import { RealtimeProfile, OutfitPreview } from '../types/dynamicOnboarding';
import Button from '../components/ui/Button';
import ImageWithFallback from '../components/ui/ImageWithFallback';
import LoadingFallback from '../components/ui/LoadingFallback';
import { trackEvent } from '../utils/analytics';
import toast from 'react-hot-toast';

const DynamicResultsPage: React.FC = () => {
  const { user } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get dynamic data from navigation state
  const dynamicProfile = location.state?.dynamicProfile as RealtimeProfile;
  const dynamicOutfits = location.state?.dynamicOutfits as OutfitPreview[];
  const analytics = location.state?.analytics;
  
  const [selectedOutfit, setSelectedOutfit] = useState<OutfitPreview | null>(null);
  const [showPersonalityInsights, setShowPersonalityInsights] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    if (!dynamicProfile) {
      // Redirect to onboarding if no dynamic data
      navigate('/dynamic-onboarding');
      return;
    }

    // Track results view
    trackEvent('dynamic_results_viewed', 'engagement', 'results', 1, {
      archetype: dynamicProfile.styleArchetype,
      confidence: dynamicProfile.confidence,
      outfit_count: dynamicOutfits?.length || 0
    });

    // Show personality insights after 3 seconds
    setTimeout(() => setShowPersonalityInsights(true), 3000);
  }, [dynamicProfile, dynamicOutfits, navigate]);

  const handleOutfitSelect = (outfit: OutfitPreview) => {
    setSelectedOutfit(outfit);
    
    trackEvent('dynamic_outfit_selected', 'engagement', 'outfit_interaction', 1, {
      outfit_id: outfit.id,
      confidence: outfit.confidence,
      match_percentage: outfit.matchPercentage
    });
  };

  const handleSaveOutfit = async (outfit: OutfitPreview) => {
    if (!user?.id) return;

    try {
      // Save to user's favorites (would integrate with existing save system)
      toast.success(`${outfit.title} opgeslagen!`);
      
      trackEvent('dynamic_outfit_saved', 'engagement', 'outfit_save', 1, {
        outfit_id: outfit.id,
        user_id: user.id
      });
    } catch (error) {
      toast.error('Kon outfit niet opslaan');
    }
  };

  const handleShareResults = async () => {
    setIsSharing(true);
    
    try {
      const shareText = `Ik heb zojuist mijn perfecte stijl ontdekt met FitFi's AI! 🎨 Mijn archetype: ${dynamicProfile.styleArchetype} met ${Math.round(dynamicProfile.confidence * 100)}% nauwkeurigheid.`;
      const shareUrl = `${window.location.origin}?ref=dynamic_results`;

      if (navigator.share) {
        await navigator.share({
          title: 'Mijn AI Style Report van FitFi',
          text: shareText,
          url: shareUrl
        });
      } else {
        await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
        toast.success('Resultaten gekopieerd naar klembord!');
      }

      trackEvent('dynamic_results_shared', 'engagement', 'social_share', 1, {
        archetype: dynamicProfile.styleArchetype,
        confidence: dynamicProfile.confidence
      });
    } catch (error) {
      console.error('Share error:', error);
    } finally {
      setIsSharing(false);
    }
  };

  if (!dynamicProfile) {
    return <LoadingFallback fullScreen message="Resultaten laden..." />;
  }

  const getPersonalityInsights = () => {
    const traits = dynamicProfile.personalityTraits;
    const insights = [];

    if (traits.confidence > 0.7) {
      insights.push({
        icon: <Target className="w-5 h-5" />,
        title: 'Natuurlijke Leider',
        description: 'Je uitstraalt zelfvertrouwen en neemt graag het voortouw.',
        color: 'text-blue-600'
      });
    }

    if (traits.creativity > 0.7) {
      insights.push({
        icon: <Sparkles className="w-5 h-5" />,
        title: 'Creatieve Geest',
        description: 'Je hebt een artistieke kijk op mode en durft te experimenteren.',
        color: 'text-purple-600'
      });
    }

    if (traits.authenticity > 0.7) {
      insights.push({
        icon: <Heart className="w-5 h-5" />,
        title: 'Authentiek Persoon',
        description: 'Je blijft trouw aan jezelf en je eigen stijl.',
        color: 'text-pink-600'
      });
    }

    return insights;
  };

  return (
    <>
      <Helmet>
        <title>Jouw Dynamische Stijlresultaten - AI-Powered Analysis | FitFi</title>
        <meta name="description" content={`Ontdek jouw ${dynamicProfile.styleArchetype} stijlprofiel met ${Math.round(dynamicProfile.confidence * 100)}% nauwkeurigheid via Nova's AI-analyse.`} />
        <meta property="og:title" content="Mijn AI Style Report van FitFi" />
        <meta property="og:description" content={`Ik ben een ${dynamicProfile.styleArchetype} met ${Math.round(dynamicProfile.confidence * 100)}% match!`} />
        <link rel="canonical" href="https://fitfi.app/dynamic-results" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-[#FAF8F6] via-white to-[#F5F3F0]">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <Link 
              to="/dashboard" 
              className="inline-flex items-center text-[#89CFF0] hover:text-[#89CFF0]/80 transition-colors mb-6"
            >
              <ArrowLeft size={20} className="mr-2" />
              Terug naar dashboard
            </Link>
            
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-20 h-20 bg-gradient-to-br from-[#89CFF0] to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <Brain className="w-10 h-10 text-white" />
              </motion.div>
              
              <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-4">
                Jouw Dynamische Stijlprofiel
              </h1>
              
              <div className="flex items-center justify-center space-x-4 mb-6">
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="text-lg font-medium text-gray-900">
                    {Math.round(dynamicProfile.confidence * 100)}% Nauwkeurigheid
                  </span>
                </div>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <span className="text-gray-600 capitalize">
                  {dynamicProfile.styleArchetype.replace('_', ' ')} Archetype
                </span>
              </div>

              <Button
                onClick={handleShareResults}
                variant="outline"
                disabled={isSharing}
                icon={<Share2 size={16} />}
                iconPosition="left"
                className="border-[#89CFF0] text-[#89CFF0] hover:bg-[#89CFF0] hover:text-white"
              >
                {isSharing ? 'Delen...' : 'Deel je resultaten'}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Results */}
            <div className="lg:col-span-2 space-y-8">
              {/* Style Analysis */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl shadow-sm p-8"
              >
                <h2 className="text-2xl font-medium text-[#0D1B2A] mb-6">
                  Jouw Stijlanalyse
                </h2>
                
                <div className="bg-gradient-to-r from-[#89CFF0]/10 to-purple-50 rounded-2xl p-6 mb-6">
                  <h3 className="text-xl font-medium text-[#0D1B2A] mb-3 capitalize">
                    {dynamicProfile.styleArchetype.replace('_', ' ')} Persoonlijkheid
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Gebaseerd op jouw antwoorden en gedragspatronen heeft Nova bepaald dat je een 
                    <strong> {dynamicProfile.styleArchetype.replace('_', ' ')}</strong> stijlpersoonlijkheid hebt. 
                    Dit betekent dat je waardeert: {Object.entries(dynamicProfile.personalityTraits)
                      .filter(([_, value]) => value > 0.6)
                      .map(([trait]) => trait)
                      .join(', ')}.
                  </p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {Object.entries(dynamicProfile.predictedPreferences).map(([style, value]) => (
                      <div key={style} className="text-center">
                        <div className="text-sm text-gray-600 mb-1 capitalize">{style}</div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-[#89CFF0] h-2 rounded-full transition-all duration-500"
                            style={{ width: `${(value / 5) * 100}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{value}/5</div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Outfit Recommendations */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-3xl shadow-sm p-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-medium text-[#0D1B2A]">
                    Jouw AI-Gegenereerde Outfits
                  </h2>
                  <div className="flex items-center space-x-2 text-sm text-[#89CFF0]">
                    <Zap size={16} />
                    <span>Realtime gegenereerd</span>
                  </div>
                </div>

                {dynamicOutfits && dynamicOutfits.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {dynamicOutfits.map((outfit, index) => (
                      <motion.div
                        key={outfit.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group cursor-pointer"
                        onClick={() => handleOutfitSelect(outfit)}
                      >
                        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-4">
                          <ImageWithFallback
                            src={outfit.imageUrl}
                            alt={outfit.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            componentName="DynamicResults"
                          />
                          
                          {/* Match percentage */}
                          <div className="absolute top-3 left-3 bg-[#89CFF0] text-white px-3 py-1 rounded-full text-sm font-bold">
                            {outfit.matchPercentage}% Match
                          </div>
                          
                          {/* Action buttons */}
                          <div className="absolute top-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSaveOutfit(outfit);
                              }}
                              className="w-8 h-8 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                            >
                              <Heart size={16} className="text-gray-700" />
                            </button>
                          </div>
                          
                          {/* Confidence indicator */}
                          <div className="absolute bottom-3 left-3 right-3">
                            <div className="bg-black/50 backdrop-blur-sm rounded-lg p-2">
                              <div className="flex items-center justify-between text-white text-xs">
                                <span>AI Confidence</span>
                                <span>{Math.round(outfit.confidence * 100)}%</span>
                              </div>
                              <div className="w-full bg-white/20 rounded-full h-1 mt-1">
                                <div 
                                  className="bg-white h-1 rounded-full transition-all duration-500"
                                  style={{ width: `${outfit.confidence * 100}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <h3 className="font-medium text-[#0D1B2A] group-hover:text-[#89CFF0] transition-colors">
                            {outfit.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {outfit.products.length} items • €{outfit.products.reduce((sum, p) => sum + p.price, 0).toFixed(0)} totaal
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShoppingBag className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-600">Geen outfits gegenereerd</p>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Personality Insights */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: showPersonalityInsights ? 1 : 0, x: showPersonalityInsights ? 0 : 20 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-3xl shadow-sm p-6"
              >
                <div className="flex items-center space-x-2 mb-4">
                  <Brain className="w-5 h-5 text-[#89CFF0]" />
                  <h3 className="font-medium text-[#0D1B2A]">Persoonlijkheids-inzichten</h3>
                </div>

                <div className="space-y-4">
                  {getPersonalityInsights().map((insight, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.2 }}
                      className="flex items-start space-x-3"
                    >
                      <div className={`${insight.color} mt-1`}>
                        {insight.icon}
                      </div>
                      <div>
                        <h4 className="font-medium text-[#0D1B2A] text-sm">{insight.title}</h4>
                        <p className="text-gray-600 text-xs">{insight.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Behavior Analytics */}
              {analytics && (
                <div className="bg-white rounded-3xl shadow-sm p-6">
                  <h3 className="font-medium text-[#0D1B2A] mb-4">Jouw Gedragspatroon</h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Interactie Confidence:</span>
                      <span className="font-medium text-[#89CFF0]">
                        {Math.round(analytics.behaviorMetrics.interactionConfidence * 100)}%
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tijd Besteed:</span>
                      <span className="font-medium text-gray-900">
                        {Math.round(analytics.behaviorMetrics.timeSpent / 1000)}s
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">AI Nauwkeurigheid:</span>
                      <span className="font-medium text-green-600">
                        {Math.round(analytics.aiRecommendationAccuracy * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Next Steps */}
              <div className="bg-gradient-to-br from-[#89CFF0]/10 to-purple-50 rounded-3xl p-6">
                <h3 className="font-medium text-[#0D1B2A] mb-4">Volgende Stappen</h3>
                
                <div className="space-y-3">
                  <Button
                    as={Link}
                    to="/outfits"
                    variant="primary"
                    size="sm"
                    fullWidth
                    icon={<ShoppingBag size={16} />}
                    iconPosition="left"
                    className="bg-[#89CFF0] hover:bg-[#89CFF0]/90 text-[#0D1B2A]"
                  >
                    Bekijk Alle Outfits
                  </Button>
                  
                  <Button
                    onClick={() => navigate('/dynamic-onboarding')}
                    variant="outline"
                    size="sm"
                    fullWidth
                    icon={<Sparkles size={16} />}
                    iconPosition="left"
                    className="border-[#89CFF0] text-[#89CFF0] hover:bg-[#89CFF0] hover:text-white"
                  >
                    Verfijn Profiel
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Selected Outfit Modal */}
          {selectedOutfit && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
              onClick={() => setSelectedOutfit(null)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-medium text-[#0D1B2A]">{selectedOutfit.title}</h3>
                    <button
                      onClick={() => setSelectedOutfit(null)}
                      className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                    >
                      ×
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="aspect-[3/4] rounded-2xl overflow-hidden">
                      <ImageWithFallback
                        src={selectedOutfit.imageUrl}
                        alt={selectedOutfit.title}
                        className="w-full h-full object-cover"
                        componentName="DynamicResults"
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-[#0D1B2A] mb-2">Waarom dit perfect bij je past:</h4>
                        <ul className="space-y-1">
                          {selectedOutfit.reasoning.map((reason, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-start space-x-2">
                              <span className="text-[#89CFF0] mt-1">•</span>
                              <span>{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium text-[#0D1B2A] mb-3">Items in deze outfit:</h4>
                        <div className="space-y-2">
                          {selectedOutfit.products.map((product) => (
                            <div key={product.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                              <div className="w-10 h-10 rounded-lg overflow-hidden">
                                <ImageWithFallback
                                  src={product.imageUrl}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                  componentName="DynamicResults"
                                />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">{product.name}</p>
                                <p className="text-xs text-gray-600">{product.brand} • €{product.price}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Button
                        variant="primary"
                        fullWidth
                        icon={<ShoppingBag size={16} />}
                        iconPosition="left"
                        className="bg-[#89CFF0] hover:bg-[#89CFF0]/90 text-[#0D1B2A]"
                      >
                        Shop deze look
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};

const getPersonalityInsights = (traits: Record<string, number>) => {
  const insights = [];

  if (traits.confidence > 0.7) {
    insights.push({
      icon: <Target className="w-5 h-5" />,
      title: 'Natuurlijke Leider',
      description: 'Je uitstraalt zelfvertrouwen en neemt graag het voortouw.',
      color: 'text-blue-600'
    });
  }

  if (traits.creativity > 0.7) {
    insights.push({
      icon: <Sparkles className="w-5 h-5" />,
      title: 'Creatieve Geest',
      description: 'Je hebt een artistieke kijk op mode en durft te experimenteren.',
      color: 'text-purple-600'
    });
  }

  if (traits.authenticity > 0.7) {
    insights.push({
      icon: <Heart className="w-5 h-5" />,
      title: 'Authentiek Persoon',
      description: 'Je blijft trouw aan jezelf en je eigen stijl.',
      color: 'text-pink-600'
    });
  }

  return insights;
};

export default DynamicResultsPage;