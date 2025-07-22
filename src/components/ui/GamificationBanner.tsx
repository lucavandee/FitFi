import React, { useState } from 'react';
import { X, Crown, Zap, Gift } from 'lucide-react';
import Button from './Button';
import { useGamification } from '../../context/GamificationContext';
import { useUser } from '../../context/UserContext';
import { motion } from 'framer-motion';

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
      <motion.div 
        className="bg-white dark:bg-midnight-800 rounded-xl shadow-md p-6 border border-turquoise-200 dark:border-turquoise-800 mb-6 transition-colors"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="relative">
          <button
            onClick={handleDismiss}
            className="absolute top-0 right-0 text-textSecondary-light dark:text-textSecondary-dark hover:text-textPrimary-light dark:hover:text-textPrimary-dark transition-colors"
            aria-label="Banner sluiten"
          >
            <X size={20} />
          </button>
          
          <div className="flex items-center space-x-4">
            <div className="text-3xl animate-bounce">🎉</div>
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-1 text-textPrimary-light dark:text-textPrimary-dark">
                Winter Mode Week is Live!
              </h3>
              <p className="text-textSecondary-light dark:text-textSecondary-dark text-sm">
                Verdien <strong>{multiplier}x punten</strong> op alle acties tijdens dit speciale evenement. 
                Voltooi uitdagingen om exclusieve winter badges te ontgrendelen!
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Gift className="text-turquoise-500" size={24} />
              <span className="font-bold text-lg text-textPrimary-light dark:text-textPrimary-dark">{multiplier}x</span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="bg-white dark:bg-midnight-800 rounded-xl shadow-md p-6 border border-turquoise-200 dark:border-turquoise-800 mb-6 transition-colors"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative">
        <button
          onClick={handleDismiss}
          className="absolute top-0 right-0 text-textSecondary-light dark:text-textSecondary-dark hover:text-textPrimary-light dark:hover:text-textPrimary-dark transition-colors"
          aria-label="Banner sluiten"
        >
          <X size={20} />
        </button>
        
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-full bg-turquoise-100 dark:bg-turquoise-900/20">
            <Crown className="text-turquoise-600 dark:text-turquoise-400" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-1 text-textPrimary-light dark:text-textPrimary-dark">
              Gefeliciteerd! 🎉
            </h3>
            <p className="text-textSecondary-light dark:text-textSecondary-dark text-sm">
              Je hebt <strong>{currentLevelInfo?.name}</strong> level bereikt met {points} punten!
            </p>
          </div>
        </div>
        
        <div className="bg-lightGrey-50 dark:bg-midnight-700 rounded-lg p-4 my-4">
          <h4 className="font-semibold text-textPrimary-light dark:text-textPrimary-dark mb-2 flex items-center">
            <Zap className="mr-2 text-turquoise-500" size={18} />
            Activeer Pro en krijg:
          </h4>
          <ul className="text-sm space-y-1 text-textSecondary-light dark:text-textSecondary-dark">
            <li className="flex items-start">
              <span className="text-turquoise-500 mr-2">•</span>
              <span><strong>Dubbele punten</strong> op alle acties</span>
            </li>
            <li className="flex items-start">
              <span className="text-turquoise-500 mr-2">•</span>
              <span><strong>Premium uitdagingen</strong> met hogere beloningen</span>
            </li>
            <li className="flex items-start">
              <span className="text-turquoise-500 mr-2">•</span>
              <span><strong>Exclusieve aanbiedingen</strong> bij onze partners</span>
            </li>
            <li className="flex items-start">
              <span className="text-turquoise-500 mr-2">•</span>
              <span><strong>Onbeperkte aanbevelingen</strong> en styling advies</span>
            </li>
          </ul>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="primary"
            onClick={handleUpgrade}
            icon={<Crown size={18} />}
            iconPosition="left"
            className="flex-1"
          >
            Upgrade naar Pro
          </Button>
          <Button
            variant="ghost"
            onClick={handleDismiss}
            className="text-textPrimary-light dark:text-textPrimary-dark border border-lightGrey-300 dark:border-midnight-600 hover:bg-lightGrey-100 dark:hover:bg-midnight-700"
          >
            Misschien later
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default GamificationBanner;