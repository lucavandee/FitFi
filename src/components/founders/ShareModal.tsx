import React, { useState } from 'react';
import { X, Instagram, Copy, Share2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/Button';
import toast from 'react-hot-toast';

interface ShareModalProps {
  referralCode: string;
  onClose: () => void;
  className?: string;
}

const ShareModal: React.FC<ShareModalProps> = ({
  referralCode,
  onClose,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);

  React.useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const referralUrl = `${window.location.origin}?ref=${referralCode}`;
  
  const instagramText = `🚀 Ik ben nu FitFi Founding Member! 

Ontdek jouw perfecte stijl met AI-powered personal styling. 

Word ook Founding Member via mijn link: ${referralUrl}

#FitFi #FoundingMember #AIStyle #PersonalStyling`;

  const handleInstagramShare = () => {
    // Copy text to clipboard for Instagram
    navigator.clipboard.writeText(instagramText);
    toast.success('Instagram tekst gekopieerd! Plak in je Story');
    
    // Open Instagram
    window.open('https://www.instagram.com/xfitfi/', '_blank', 'noopener,noreferrer');
    
    handleClose();
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      toast.success('Referral link gekopieerd!');
      handleClose();
    } catch (error) {
      toast.error('Kon link niet kopiëren');
    }
  };

  const handleGenericShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Word FitFi Founding Member',
          text: 'Ontdek jouw perfecte stijl met AI-powered personal styling',
          url: referralUrl
        });
        handleClose();
      } catch (error) {
        // User cancelled or error occurred
        console.log('Share cancelled or failed');
      }
    } else {
      // Fallback to copy
      handleCopyLink();
    }
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const modalVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8, 
      y: 50 
    },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8, 
      y: 50,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <AnimatePresence>
      <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${className}`}>
        {/* Backdrop */}
        <motion.div 
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        />
        
        {/* Modal */}
        <motion.div 
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative bg-foundersCardBg dark:bg-foundersCardBgDark rounded-3xl shadow-2xl max-w-md w-full border border-white/20"
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center transition-colors duration-200 focus:ring-2 focus:ring-foundersGradientFrom focus:ring-offset-2"
            aria-label="Sluit share modal"
          >
            <X size={16} className="text-gray-600 dark:text-gray-300" />
          </button>

          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-6">
              <motion.div 
                className="w-16 h-16 bg-gradient-to-br from-foundersGradientFrom to-foundersGradientTo rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  duration: 0.6, 
                  delay: 0.2,
                  type: "spring",
                  stiffness: 200
                }}
              >
                <Sparkles className="w-8 h-8 text-white" />
              </motion.div>
              
              <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-neutral-100 mb-2">
                Deel je Founders Club link
              </h2>
              
              <p className="text-gray-600 dark:text-neutral-300">
                Help vrienden hun perfecte stijl te ontdekken
              </p>
            </div>

            {/* Preview */}
            <motion.div 
              className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 mb-6 border border-gray-200 dark:border-gray-700"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="text-sm text-gray-700 dark:text-neutral-300 font-mono break-all">
                <strong>fitfi.ai?ref={referralCode}</strong>
              </div>
            </motion.div>

            {/* Share Options */}
            <motion.div 
              className="space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Button
                variant="outline"
                fullWidth
                onClick={handleInstagramShare}
                icon={<Instagram size={20} />}
                iconPosition="left"
                className="border-2 border-pink-300 text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-all duration-300 hover:scale-[1.02]"
              >
                Deel op Instagram
              </Button>
              
              <Button
                variant="outline"
                fullWidth
                onClick={handleCopyLink}
                icon={<Copy size={20} />}
                iconPosition="left"
                className="border-2 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 hover:scale-[1.02]"
              >
                Kopieer Link
              </Button>
              
              <Button
                variant="primary"
                fullWidth
                onClick={handleGenericShare}
                icon={<Share2 size={20} />}
                iconPosition="left"
                className="bg-gradient-to-r from-foundersGradientFrom to-foundersGradientTo text-white hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
              >
                Meer opties
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ShareModal;