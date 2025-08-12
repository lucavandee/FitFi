import React, { useState } from 'react';
import { Sparkles, ArrowRight, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import ImageWithFallback from '../ui/ImageWithFallback';
import { track } from '@/utils/analytics';

interface NovaInsightCardProps {
  insight?: string;
  onSeeOutfits?: () => void;
  loading?: boolean;
  className?: string;
}

const NovaInsightCard: React.FC<NovaInsightCardProps> = ({
  insight,
  onSeeOutfits,
  loading = false,
  className = ''
}) => {
  const navigate = useNavigate();
  const [isFlipped, setIsFlipped] = useState(false);
  
  const defaultInsight = "Deze week scoor je met warme lagen in navy — combineer textuur met minimalistische sneakers.";
  const displayInsight = insight || defaultInsight;
  
  const handleSeeOutfits = () => {
    track('nova_insight_cta_click', {
      insight_preview: displayInsight.substring(0, 50),
      source: 'dashboard_nova_card'
    });
    
    if (onSeeOutfits) {
      onSeeOutfits();
    } else {
      navigate('/outfits');
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    track('nova_insight_flip', {
      flipped_to: isFlipped ? 'front' : 'back',
      source: 'dashboard'
    });
  };

  if (loading) {
    return (
      <div className={`bg-gradient-to-br from-[#0D1B2A] to-[#1f2f46] rounded-3xl p-6 shadow-lg animate-pulse ${className}`}>
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-white/20 rounded-full"></div>
          <div className="space-y-2">
            <div className="h-4 bg-white/20 rounded w-24"></div>
            <div className="h-3 bg-white/20 rounded w-16"></div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-white/20 rounded w-3/4"></div>
          <div className="h-4 bg-white/20 rounded w-1/2"></div>
          <div className="h-10 bg-white/20 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative bg-gradient-to-br from-[#0D1B2A] to-[#1f2f46] rounded-3xl shadow-lg overflow-hidden group cursor-pointer ${className}`}>
      {/* Flip Container */}
      <div 
        className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
        onClick={handleFlip}
      >
        {/* Front Side */}
        <div className={`absolute inset-0 backface-hidden ${isFlipped ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}>
          <div className="p-6 text-white">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#89CFF0] rounded-full flex items-center justify-center shadow-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-white">Nova's Daily Insight</h3>
                  <p className="text-white/70 text-sm">Jouw persoonlijke stijltip</p>
                </div>
              </div>
              
              <button className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                <RotateCcw className="w-4 h-4 text-white/70" />
              </button>
            </div>

            {/* Insight Content */}
            <div className="mb-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-16 h-16 rounded-2xl overflow-hidden">
                  <ImageWithFallback
                    src="https://images.pexels.com/photos/5935748/pexels-photo-5935748.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2"
                    alt="Nova's stijltip"
                    className="w-full h-full object-cover"
                    componentName="NovaInsightCard"
                  />
                </div>
                
                <div className="flex-1">
                  <p className="text-lg leading-relaxed text-white/90 mb-4">
                    {displayInsight}
                  </p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <Button
              onClick={handleSeeOutfits}
              variant="secondary"
              size="lg"
              fullWidth
              icon={<ArrowRight size={18} />}
              iconPosition="right"
              className="bg-white/10 backdrop-blur-sm text-white border-white/20 hover:bg-white/20 transition-all"
            >
              Bekijk outfits
            </Button>
          </div>
        </div>

        {/* Back Side */}
        <div className={`absolute inset-0 backface-hidden rotate-y-180 ${isFlipped ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}>
          <div className="p-6 text-white">
            <div className="flex items-center space-x-3 mb-4">
              <Sparkles className="w-6 h-6 text-[#89CFF0]" />
              <h4 className="font-medium">Waarom deze tip?</h4>
            </div>
            
            <p className="text-white/90 leading-relaxed mb-6">
              Nova heeft je stijlprofiel geanalyseerd en ziet dat je van minimalistische elegantie houdt. 
              Navy is jouw power color en textuurmix voegt visuele interesse toe zonder je clean aesthetic te verstoren.
            </p>
            
            <div className="space-y-2 text-sm text-white/70">
              <div>• Gebaseerd op je quiz resultaten</div>
              <div>• Aangepast aan het seizoen</div>
              <div>• 94% match met je stijlprofiel</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NovaInsightCard;