import React, { useState } from 'react';
import { X, Instagram, Copy, Share2, Sparkles } from 'lucide-react';
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
  const [isOpen, setIsOpen] = useState(true);

  const referralUrl = `${window.location.origin}?ref=${referralCode}`;
  
  const instagramText = `🚀 Ik ben nu FitFi Founding Member! 

Ontdek jouw perfecte stijl met AI-powered personal styling. 

Word ook Founding Member via mijn link: ${referralUrl}

#FitFi #FoundingMember #AIStyle #PersonalStyling`;

  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

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

  return (
    <div className={`fixed inset-0 z-60 flex items-center justify-center p-4 ${className} ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'} transition-opacity duration-300`}>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={handleClose}
      />

      {/* Modal Panel */}
      <div className={`w-full max-w-md transform overflow-hidden rounded-3xl bg-foundersCardBg dark:bg-foundersCardBgDark border border-white/20 p-8 text-left align-middle shadow-2xl transition-all duration-300 ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
                {/* Close Button */}
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center transition-colors duration-200 focus:ring-2 focus:ring-foundersGradientFrom focus:ring-offset-2 focus:outline-none"
                  aria-label="Sluit share modal"
                >
                  <X size={16} className="text-gray-600 dark:text-gray-300" />
                </button>

                {/* Header */}
                <div className="text-center mb-6">
                  <div 
                    className="w-16 h-16 bg-gradient-to-br from-foundersGradientFrom to-foundersGradientTo rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
                  >
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  
                  <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-neutral-100 mb-2">
                    Deel je Founders Club link
                  </h2>
                  
                  <p className="text-gray-600 dark:text-neutral-300">
                    Help vrienden hun perfecte stijl te ontdekken
                  </p>
                </div>

                {/* Preview */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 mb-6 border border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-700 dark:text-neutral-300 font-mono break-all">
                    <strong>fitfi.ai?ref={referralCode}</strong>
                  </div>
                </div>

                {/* Share Options */}
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={handleInstagramShare}
                    icon={<Instagram size={20} />}
                    iconPosition="left"
                    className="border-2 border-pink-300 text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-all duration-300 hover:scale-[1.02]"
                  >
                    Instagram Story
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
                </div>
      </div>
    </div>
  );
};

export default ShareModal;