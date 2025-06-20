import React, { useState } from 'react';
import { X, Crown, Zap, Gift } from 'lucide-react';
import Button from './Button';
import { useGamification } from '../../context/GamificationContext';
import { useUser } from '../../context/UserContext';

const GamificationBanner: React.FC = () => {
  const { points, currentLevelInfo, nextLevelInfo, isSeasonalEventActive, getSeasonalMultiplier } = useGamification();
  const { user } = useUser();
  const [isDismissed, setIsDismissed] = useState(false);

  // Show banner when user reaches pro level (1000+ points) and is not premium
  const shouldShowProBanner = points >= 1000 && user && !user.isPremium && !isDismissed;
  
  // Show seasonal event banner
  const shouldShowSeasonalBanner = isSeasonalEventActive() && !isDismissed;

  if (!shouldShowProBanner && !shouldShowSeasonalBanner) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  const handleUpgrade = () => {
    // Track upgrade click
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'upgrade_click', {
        event_category: 'conversion',
        event_label: 'gamification_banner',
        value: points
      });
    }
    
    // Navigate to upgrade page or show upgrade modal
    console.log('Navigate to upgrade page');
  };

  if (shouldShowSeasonalBanner) {
    const multiplier = getSeasonalMultiplier();
    
    return (
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-xl shadow-lg animate-fade-in relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 animate-pulse"></div>
        
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-white/80 hover:text-white transition-colors"
          aria-label="Banner sluiten"
        >
          <X size={20} />
        </button>
        
        <div className="relative z-10 flex items-center space-x-4">
          <div className="text-3xl animate-bounce">🎉</div>
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-1">
              Winter Mode Week is Live!
            </h3>
            <p className="text-white/90 text-sm">
              Verdien <strong>{multiplier}x punten</strong> op alle acties tijdens dit speciale evenement. 
              Voltooi uitdagingen om exclusieve winter badges te ontgrendelen!
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Gift className="text-yellow-300" size={24} />
            <span className="font-bold text-lg">{multiplier}x</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg animate-fade-in relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-orange-600/20 animate-pulse"></div>
      
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 text-white/80 hover:text-white transition-colors"
        aria-label="Banner sluiten"
      >
        <X size={20} />
      </button>
      
      <div className="relative z-10">
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-white/20 p-3 rounded-full">
            <Crown className="text-yellow-300" size={28} />
          </div>
          <div>
            <h3 className="font-bold text-xl">
              Gefeliciteerd! 🎉
            </h3>
            <p className="text-white/90">
              Je hebt <strong>{currentLevelInfo?.name}</strong> level bereikt met {points} punten!
            </p>
          </div>
        </div>
        
        <div className="bg-white/10 rounded-lg p-4 mb-4 backdrop-blur-sm">
          <h4 className="font-semibold mb-2 flex items-center">
            <Zap className="mr-2 text-yellow-300" size={18} />
            Activeer Pro en krijg:
          </h4>
          <ul className="text-sm space-y-1 text-white/90">
            <li>• <strong>Dubbele punten</strong> op alle acties</li>
            <li>• <strong>Premium uitdagingen</strong> met hogere beloningen</li>
            <li>• <strong>Exclusieve aanbiedingen</strong> bij onze partners</li>
            <li>• <strong>Onbeperkte aanbevelingen</strong> en styling advies</li>
          </ul>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="secondary"
            onClick={handleUpgrade}
            className="flex-1 bg-white text-orange-600 hover:bg-gray-100 font-bold"
            icon={<Crown size={18} />}
            iconPosition="left"
          >
            Upgrade naar Pro
          </Button>
          <Button
            variant="ghost"
            onClick={handleDismiss}
            className="text-white border-white/30 hover:bg-white/10"
          >
            Misschien later
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GamificationBanner;