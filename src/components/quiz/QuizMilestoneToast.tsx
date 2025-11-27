import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Check, Eye, Target } from 'lucide-react';
import { useEffect, useState } from 'react';

interface QuizMilestoneToastProps {
  show: boolean;
  type: 'insight' | 'preview' | 'unlock';
  message: string;
  subMessage?: string;
  onComplete?: () => void;
}

export function QuizMilestoneToast({
  show,
  type,
  message,
  subMessage,
  onComplete
}: QuizMilestoneToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onComplete?.(), 300);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  const getIcon = () => {
    switch (type) {
      case 'insight':
        return <Sparkles className="w-6 h-6" />;
      case 'preview':
        return <Eye className="w-6 h-6" />;
      case 'unlock':
        return <Check className="w-6 h-6" />;
      default:
        return <Target className="w-6 h-6" />;
    }
  };

  const getGradient = () => {
    switch (type) {
      case 'insight':
        return 'from-purple-500 to-pink-500';
      case 'preview':
        return 'from-blue-500 to-cyan-500';
      case 'unlock':
        return 'from-green-500 to-emerald-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-md px-4"
        >
          <div className={`
            bg-gradient-to-r ${getGradient()}
            rounded-2xl shadow-2xl p-4
            border-2 border-white/20
            backdrop-blur-sm
          `}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 text-white">
                {getIcon()}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-white text-lg leading-tight break-words">
                  {message}
                </h3>
                {subMessage && (
                  <p className="text-white/90 text-sm mt-1 leading-tight break-words">
                    {subMessage}
                  </p>
                )}
              </div>
            </div>

            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 3, ease: 'linear' }}
              className="h-1 bg-white/30 rounded-full mt-3"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
