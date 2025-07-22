import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { navigationService, NavigationState } from '../../services/NavigationService';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';

interface NavigationProgressProps {
  className?: string;
}

/**
 * Global navigation progress indicator that shows when navigating between pages
 * Provides visual feedback during transitions and loading states
 */
const NavigationProgress: React.FC<NavigationProgressProps> = ({ className = '' }) => {
  const [state, setState] = useState<NavigationState>(navigationService.getState());

  useEffect(() => {
    const unsubscribe = navigationService.subscribe(setState);
    return unsubscribe;
  }, []);

  if (!state.isNavigating && !state.error) {
    return null;
  }

  return (
    <AnimatePresence>
      {(state.isNavigating || state.error) && (
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={`fixed top-0 left-0 right-0 z-50 ${className}`}
        >
          {/* Progress Bar */}
          <div className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
            <div className="relative h-1 bg-gray-200 dark:bg-gray-700">
              <motion.div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-500 to-blue-500"
                initial={{ width: '0%' }}
                animate={{ width: `${state.progress}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            </div>
            
            {/* Content */}
            <div className="px-4 py-3">
              <div className="flex items-center justify-between max-w-7xl mx-auto">
                <div className="flex items-center space-x-3">
                  {state.error ? (
                    <AlertCircle className="text-red-500" size={20} />
                  ) : state.progress >= 100 ? (
                    <CheckCircle className="text-green-500" size={20} />
                  ) : (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <Loader className="text-orange-500" size={20} />
                    </motion.div>
                  )}
                  
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {state.error ? 'Navigatie fout' : state.message}
                    </p>
                    {state.targetRoute && !state.error && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Navigeren naar {state.targetRoute}
                      </p>
                    )}
                    {state.error && (
                      <p className="text-xs text-red-600 dark:text-red-400">
                        {state.error}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {Math.round(state.progress)}%
                  </p>
                  {state.progress < 100 && !state.error && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Verwerken...
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NavigationProgress;