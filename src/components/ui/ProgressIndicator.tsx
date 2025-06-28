import React from 'react';
import { motion } from 'framer-motion';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepNames?: string[];
  className?: string;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
  stepNames,
  className = ''
}) => {
  const progress = (currentStep / totalSteps) * 100;
  
  return (
    <div className={`mb-8 ${className}`}>
      <div className="flex justify-between text-sm text-white/70 mb-2">
        <span>Stap {currentStep} van {totalSteps}</span>
        <span>{Math.round(progress)}%</span>
      </div>
      
      <div className="progress-bar">
        <motion.div
          className="progress-bar-fill"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        ></motion.div>
      </div>
      
      {stepNames && (
        <div className="flex justify-between mt-2">
          {stepNames.map((name, index) => (
            <div 
              key={index} 
              className={`text-xs ${index < currentStep ? 'text-[#FF8600]' : 'text-white/50'}`}
            >
              {name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProgressIndicator;