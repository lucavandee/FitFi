import React from 'react';
import { Hash, Instagram, Camera, Gift } from 'lucide-react';
import Button from '../ui/Button';

interface CommunityChallengeProps {
  className?: string;
}

const CommunityChallenge: React.FC<CommunityChallengeProps> = ({ className = '' }) => {
  const handleShareClick = (platform: 'instagram' | 'tiktok') => {
    // Track social share intent
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'social_share_intent', {
        event_category: 'engagement',
        event_label: `${platform}_novakows`,
        page_location: window.location.href
      });
    }
    
    // Open platform-specific sharing
    if (platform === 'instagram') {
      window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer');
    } else {
      window.open('https://www.tiktok.com/', '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <section className={`py-20 bg-gradient-to-br from-purple-50 via-white to-pink-50 ${className}`} aria-labelledby="community-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 text-[#bfae9f] font-medium mb-4">
            <Hash size={20} />
            <span className="text-lg">NovaKnows</span>
          </div>
          
          <h2 id="community-heading" className="text-3xl md:text-4xl font-light text-gray-900 mb-6">
            Community Challenge
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Deel jouw inzichten en favoriete outfit op TikTok of Instagram met{' '}
            <span className="font-medium text-[#bfae9f]">#NovaKnows</span>{' '}
            en win wekelijks stylingprijzen.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-lg border border-gray-100">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Content */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-2xl font-medium text-gray-900">
                    Doe mee & win stylingprijzen!
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-[#bfae9f] text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                        1
                      </div>
                      <p className="text-gray-600">
                        Ontvang jouw AI Style Report en kies je favoriete inzicht
                      </p>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-[#bfae9f] text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                        2
                      </div>
                      <p className="text-gray-600">
                        Maak een foto van jouw outfit geïnspireerd door Nova's advies
                      </p>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-[#bfae9f] text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                        3
                      </div>
                      <p className="text-gray-600">
                        Post met <span className="font-medium">#NovaKnows</span> en tag @fitfi
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Social Buttons */}
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                  <Button
                    onClick={() => handleShareClick('instagram')}
                    variant="outline"
                    icon={<Instagram size={20} />}
                    iconPosition="left"
                    className="flex-1 border-pink-300 text-pink-600 hover:bg-pink-50"
                  >
                    Deel op Instagram
                  </Button>
                  
                  <Button
                    onClick={() => handleShareClick('tiktok')}
                    variant="outline"
                    icon={<Camera size={20} />}
                    iconPosition="left"
                    className="flex-1 border-purple-300 text-purple-600 hover:bg-purple-50"
                  >
                    Deel op TikTok
                  </Button>
                </div>
              </div>
              
              {/* Prize Visual */}
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="w-32 h-32 bg-gradient-to-br from-[#bfae9f] to-purple-400 rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg">
                    <Gift size={48} className="text-white" />
                  </div>
                  
                  <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">
                    NIEUW
                  </div>
                </div>
                
                <h4 className="text-xl font-medium text-gray-900 mb-2">
                  Wekelijkse Prijzen
                </h4>
                
                <div className="space-y-2 text-gray-600">
                  <p>🥇 €500 styling budget</p>
                  <p>🥈 €250 shopping voucher</p>
                  <p>🥉 €100 mode-accessoires</p>
                </div>
                
                <div className="mt-4 text-sm text-gray-500">
                  Elke week nieuwe winnaars!
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Stats */}
        <div className="mt-12 text-center">
          <div className="flex flex-wrap justify-center items-center space-x-8 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>2.500+ deelnemers deze maand</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
              <span>€15.000 aan prijzen uitgereikt</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommunityChallenge;