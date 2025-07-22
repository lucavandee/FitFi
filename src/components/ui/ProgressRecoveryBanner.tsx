import React, { useState, useEffect } from 'react';
import { X, RotateCw, Play, Clock } from 'lucide-react';
import Button from './Button';
import { hasSavedProgress, getRecoveryOptions } from '../../utils/progressPersistence';
import { motion, AnimatePresence } from 'framer-motion';

interface ProgressRecoveryBannerProps {
  onRecover?: (type: 'quiz' | 'onboarding', progress: any) => void;
  onDismiss?: () => void;
  className?: string;
}

/**
 * Banner that appears when saved progress is detected
 * Allows users to recover their previous session
 */
const ProgressRecoveryBanner: React.FC<ProgressRecoveryBannerProps> = ({
  onRecover,
  onDismiss,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [recoveryOptions, setRecoveryOptions] = useState<any>(null);

  useEffect(() => {
    const progressInfo = hasSavedProgress();
    
    if (progressInfo.hasQuizProgress || progressInfo.hasOnboardingProgress) {
      const options = getRecoveryOptions();
      setRecoveryOptions(options);
      setIsVisible(true);
      
      // Track banner shown
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'progress_recovery_banner_shown', {
          event_category: 'persistence',
          event_label: progressInfo.mostRecentType || 'unknown',
          has_quiz: progressInfo.hasQuizProgress,
          has_onboarding: progressInfo.hasOnboardingProgress
        });
      }
    }
  }, []);

  const handleRecover = (option: any) => {
    if (onRecover) {
      onRecover(option.type, option.progress);
    }
    
    setIsVisible(false);
    
    // Track recovery action
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'progress_recovered', {
        event_category: 'persistence',
        event_label: option.type,
        age_minutes: option.ageMinutes
      });
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    
    if (onDismiss) {
      onDismiss();
    }
    
    // Track dismissal
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'progress_recovery_dismissed', {
        event_category: 'persistence',
        event_label: 'user_dismissed'
      });
    }
  };

  if (!isVisible || !recoveryOptions?.canRecover) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.3 }}
        className={`bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-700 dark:to-blue-800 text-white shadow-lg ${className}`}
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-full">
                <RotateCw size={20} />
              </div>
              
              <div>
                <h3 className="font-semibold">
                  📱 Vorige sessie gevonden
                </h3>
                <p className="text-sm text-white/90">
                  We hebben je voortgang opgeslagen. Wil je doorgaan waar je gebleven was?
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {recoveryOptions.options.map((option: any, index: number) => (
                <Button
                  key={index}
                  variant="secondary"
                  size="sm"
                  onClick={() => handleRecover(option)}
                  icon={<Play size={14} />}
                  iconPosition="left"
                  className="bg-white/20 text-white border-white/30 hover:bg-white/30"
                >
                  {option.label}
                </Button>
              ))}
              
              <button
                onClick={handleDismiss}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                aria-label="Sluiten"
              >
                <X size={20} />
              </button>
            </div>
          </div>
          
          {/* Progress details */}
          <div className="mt-2 flex items-center space-x-4 text-xs text-white/80">
            {recoveryOptions.options.map((option: any, index: number) => (
              <div key={index} className="flex items-center space-x-1">
                <Clock size={12} />
                <span>{option.description}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProgressRecoveryBanner;