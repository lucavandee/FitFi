import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Palette, Sparkles, CheckCircle, Target } from 'lucide-react';

interface ProcessingStep {
  id: string;
  label: string;
  icon: React.ReactNode;
  duration: number;
  description: string;
}

interface ProfileProcessingIndicatorProps {
  isVisible: boolean;
  onComplete?: () => void;
  className?: string;
}

/**
 * Advanced processing indicator that shows the AI analyzing the user's profile
 * Provides detailed feedback about what's happening during profile creation
 */
const ProfileProcessingIndicator: React.FC<ProfileProcessingIndicatorProps> = ({
  isVisible,
  onComplete,
  className = ''
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  const processingSteps: ProcessingStep[] = [
    {
      id: 'analyze',
      label: 'Stijlvoorkeuren analyseren',
      icon: <Brain size={24} />,
      duration: 800,
      description: 'AI analyseert je antwoorden en voorkeuren'
    },
    {
      id: 'match',
      label: 'Archetypen matchen',
      icon: <Target size={24} />,
      duration: 600,
      description: 'Bepalen van je primaire en secundaire stijlarchetypen'
    },
    {
      id: 'generate',
      label: 'Outfits samenstellen',
      icon: <Palette size={24} />,
      duration: 1000,
      description: 'Creëren van gepersonaliseerde outfit aanbevelingen'
    },
    {
      id: 'personalize',
      label: 'Personaliseren',
      icon: <Sparkles size={24} />,
      duration: 700,
      description: 'Afstemmen op jouw unieke stijl en voorkeuren'
    }
  ];

  useEffect(() => {
    if (!isVisible) {
      // Reset state when not visible
      setCurrentStep(0);
      setCompletedSteps([]);
      setProgress(0);
      return;
    }

    let stepIndex = 0;
    let totalProgress = 0;

    const processNextStep = () => {
      if (stepIndex >= processingSteps.length) {
        // All steps completed
        setProgress(100);
        setTimeout(() => {
          if (onComplete) {
            onComplete();
          }
        }, 500);
        return;
      }

      const step = processingSteps[stepIndex];
      setCurrentStep(stepIndex);

      // Animate progress for this step
      const stepProgress = 100 / processingSteps.length;
      const startProgress = totalProgress;
      const endProgress = totalProgress + stepProgress;

      let currentProgress = startProgress;
      const progressIncrement = stepProgress / (step.duration / 50);

      const progressInterval = setInterval(() => {
        currentProgress += progressIncrement;
        if (currentProgress >= endProgress) {
          currentProgress = endProgress;
          clearInterval(progressInterval);
          
          // Mark step as completed
          setCompletedSteps(prev => [...prev, step.id]);
          totalProgress = endProgress;
          setProgress(totalProgress);
          
          // Move to next step
          stepIndex++;
          setTimeout(processNextStep, 200);
        } else {
          setProgress(currentProgress);
        }
      }, 50);
    };

    // Start processing
    processNextStep();
  }, [isVisible, onComplete]);

  if (!isVisible) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full ${className}`}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          animate={{ rotate: progress < 100 ? 360 : 0 }}
          transition={{ duration: 2, repeat: progress < 100 ? Infinity : 0, ease: 'linear' }}
          className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-orange-500 to-blue-500 rounded-full flex items-center justify-center"
        >
          <Brain className="text-white" size={32} />
        </motion.div>
        
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          AI aan het werk
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Je persoonlijke stijlprofiel wordt gemaakt
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span>Voortgang</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-orange-500 to-blue-500"
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Processing Steps */}
      <div className="space-y-4">
        {processingSteps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = completedSteps.includes(step.id);
          const isPending = index > currentStep;

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={`flex items-center space-x-4 p-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800' 
                  : isCompleted
                    ? 'bg-green-50 dark:bg-green-900/20'
                    : 'bg-gray-50 dark:bg-gray-700'
              }`}
            >
              {/* Icon */}
              <div className={`p-2 rounded-full ${
                isCompleted 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                  : isActive
                    ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                    : 'bg-gray-100 dark:bg-gray-600 text-gray-400'
              }`}>
                {isCompleted ? (
                  <CheckCircle size={24} />
                ) : isActive ? (
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    {step.icon}
                  </motion.div>
                ) : (
                  step.icon
                )}
              </div>

              {/* Content */}
              <div className="flex-1">
                <p className={`font-medium ${
                  isCompleted 
                    ? 'text-green-700 dark:text-green-300'
                    : isActive
                      ? 'text-orange-700 dark:text-orange-300'
                      : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {step.label}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {step.description}
                </p>
              </div>

              {/* Status */}
              <div className="text-right">
                {isCompleted && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-green-500"
                  >
                    ✓
                  </motion.div>
                )}
                {isActive && (
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-2 h-2 bg-orange-500 rounded-full"
                  />
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Completion Message */}
      {progress >= 100 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 text-center"
        >
          <div className="text-green-600 dark:text-green-400 mb-2">
            <CheckCircle size={32} className="mx-auto" />
          </div>
          <p className="font-medium text-gray-900 dark:text-white">
            Profiel voltooid!
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Je wordt doorgestuurd naar je aanbevelingen...
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ProfileProcessingIndicator;