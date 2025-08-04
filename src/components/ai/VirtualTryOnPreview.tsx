import React, { useState, useEffect } from 'react';
import { Eye, Sparkles, RotateCcw, Zap } from 'lucide-react';
import { Outfit, Product } from '../../engine/types';
import { UserProfile } from '../../context/UserContext';
import ImageWithFallback from '../ui/ImageWithFallback';
import Button from '../ui/Button';

interface VirtualTryOnPreviewProps {
  outfit: Outfit;
  user: UserProfile;
  className?: string;
  showControls?: boolean;
  onInteraction?: (interaction: 'like' | 'dislike' | 'try_on') => void;
}

const VirtualTryOnPreview: React.FC<VirtualTryOnPreviewProps> = ({
  outfit,
  user,
  className = '',
  showControls = true,
  onInteraction
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'outfit' | 'individual'>('outfit');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [confidence, setConfidence] = useState(outfit.matchPercentage || 85);

  useEffect(() => {
    // Simulate AI processing time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [outfit.id]);

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setCurrentView('individual');
    
    if (onInteraction) {
      onInteraction('try_on');
    }
  };

  const handleViewToggle = () => {
    setCurrentView(currentView === 'outfit' ? 'individual' : 'outfit');
    setSelectedProduct(null);
  };

  const getGenderAvatar = () => {
    // Use gender-appropriate avatar
    if (user.gender === 'male') {
      return 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2';
    } else {
      return 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2';
    }
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-3xl shadow-sm p-6 ${className}`}>
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-[#89CFF0] to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nova genereert je virtual try-on...</h3>
          <p className="text-gray-600 text-sm">AI berekent hoe deze outfit op jou staat</p>
          
          <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
            <div className="bg-[#89CFF0] h-2 rounded-full animate-pulse" style={{ width: '75%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-3xl shadow-sm overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-[#89CFF0] to-blue-500 rounded-full flex items-center justify-center">
              <Eye className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Virtual Try-On Preview</h3>
              <p className="text-sm text-gray-600">AI-powered outfit visualization</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="text-right">
              <div className="text-lg font-bold text-[#89CFF0]">{confidence}%</div>
              <div className="text-xs text-gray-500">Match</div>
            </div>
          </div>
        </div>
      </div>

      {/* Virtual Try-On Area */}
      <div className="relative">
        {/* Main Preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* Avatar/Model */}
          <div className="relative aspect-[3/4] bg-gradient-to-br from-gray-50 to-gray-100">
            <ImageWithFallback
              src={getGenderAvatar()}
              alt="Virtual try-on model"
              className="w-full h-full object-cover"
              componentName="VirtualTryOnPreview"
            />
            
            {/* Outfit Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent">
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <Sparkles className="w-4 h-4 text-[#89CFF0]" />
                    <span className="text-sm font-medium text-gray-900">Nova's Visualisatie</span>
                  </div>
                  <p className="text-xs text-gray-700">
                    Deze outfit is aangepast aan jouw {user.gender === 'male' ? 'mannelijke' : 'vrouwelijke'} lichaamsbouw
                  </p>
                </div>
              </div>
            </div>
            
            {/* AI Processing Indicator */}
            <div className="absolute top-4 left-4">
              <div className="bg-[#89CFF0] text-white px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span>AI Active</span>
              </div>
            </div>
          </div>
          
          {/* Outfit Details */}
          <div className="p-6">
            <div className="mb-6">
              <h4 className="text-xl font-medium text-gray-900 mb-2">{outfit.title}</h4>
              <p className="text-gray-600 text-sm leading-relaxed">{outfit.description}</p>
            </div>

            {/* Products Grid */}
            <div className="space-y-4">
              <h5 className="font-medium text-gray-900">Items in deze outfit:</h5>
              <div className="grid grid-cols-2 gap-3">
                {outfit.products.slice(0, 4).map((product, index) => (
                  <button
                    key={product.id}
                    onClick={() => handleProductSelect(product)}
                    className={`p-3 rounded-xl border-2 transition-all hover:scale-105 ${
                      selectedProduct?.id === product.id
                        ? 'border-[#89CFF0] bg-[#89CFF0]/10'
                        : 'border-gray-200 hover:border-[#89CFF0]/50'
                    }`}
                  >
                    <div className="aspect-square rounded-lg overflow-hidden mb-2">
                      <ImageWithFallback
                        src={product.imageUrl || 'https://images.pexels.com/photos/5935748/pexels-photo-5935748.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2'}
                        alt={product.name || 'Product'}
                        className="w-full h-full object-cover"
                        componentName="VirtualTryOnPreview"
                      />
                    </div>
                    <p className="text-xs font-medium text-gray-900 truncate">
                      {product.name || 'Stijlvol Item'}
                    </p>
                    <p className="text-xs text-gray-600">
                      {product.brand || 'FitFi'} • €{product.price?.toFixed(2) || '49.99'}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* AI Insights */}
            <div className="mt-6 p-4 bg-gradient-to-r from-[#89CFF0]/10 to-purple-50 rounded-xl">
              <div className="flex items-center space-x-2 mb-2">
                <Zap className="w-4 h-4 text-[#89CFF0]" />
                <span className="text-sm font-medium text-gray-900">Nova's Inzicht</span>
              </div>
              <p className="text-sm text-gray-700">
                Deze outfit is {confidence}% geschikt voor jouw {outfit.archetype.replace('_', ' ')} stijl. 
                De kleuren en pasvorm zijn aangepast aan jouw voorkeuren en lichaamsbouw.
              </p>
            
            {/* Nova's Explanation */}
            {outfit.novaExplanation && (
              <div className="mt-3 p-3 bg-white/50 rounded-lg border-l-4 border-[#89CFF0]">
                <div className="flex items-center space-x-2 mb-1">
                  <Sparkles className="w-3 h-3 text-[#89CFF0]" />
                  <span className="text-xs font-medium text-[#89CFF0]">Nova zegt:</span>
                </div>
                <p className="text-xs text-gray-700 italic">"{outfit.novaExplanation}"</p>
              </div>
            )}
            </div>
          </div>
        </div>

        {/* Controls */}
        {showControls && (
          <div className="p-6 border-t border-gray-100 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleViewToggle}
                  icon={<RotateCcw size={16} />}
                  iconPosition="left"
                  className="border-gray-300 text-gray-600 hover:bg-gray-100"
                >
                  {currentView === 'outfit' ? 'Bekijk Items' : 'Bekijk Outfit'}
                </Button>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onInteraction?.('dislike')}
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  Niet mijn stijl
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onInteraction?.('like')}
                  className="bg-[#89CFF0] hover:bg-[#89CFF0]/90 text-[#0D1B2A]"
                >
                  Love it! 💖
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VirtualTryOnPreview;