import React from 'react';
import { motion } from 'framer-motion';

interface ResultsLoaderProps {
  message?: string;
  className?: string;
}

const ResultsLoader: React.FC<ResultsLoaderProps> = ({
  message = 'Je persoonlijke stijlaanbevelingen worden geladen...',
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-16 ${className}`}>
      <div className="relative w-24 h-24 mb-6">
        <motion.div
          className="absolute inset-0 border-4 border-turquoise-500 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute inset-2 border-4 border-turquoise-400 border-b-transparent rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />
      </div>
      
      <motion.h2
        className="text-2xl font-bold text-textPrimary-light dark:text-textPrimary-dark mb-3"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        AI aan het werk
      </motion.h2>
      
      <p className="text-textSecondary-light dark:text-textSecondary-dark text-center max-w-md">
        {message}
      </p>
      
      <div className="mt-8 space-y-2">
        <motion.div 
          className="h-2 w-64 bg-lightGrey-200 dark:bg-midnight-700 rounded-full overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.div 
            className="h-full bg-gradient-to-r from-turquoise-500 to-turquoise-400"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 3, ease: 'easeInOut' }}
          />
        </motion.div>
        
        <motion.div 
          className="flex justify-between text-xs text-textSecondary-light dark:text-textSecondary-dark"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <span>Stijlprofiel analyseren</span>
          <span>Outfits samenstellen</span>
        </motion.div>
      </div>
    </div>
  );
};

export default ResultsLoader;