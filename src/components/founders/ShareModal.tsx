import React, { useState } from 'react';
import { X, Instagram, Copy, Share2 } from 'lucide-react';
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

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${className}`}>
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className={`relative bg-white rounded-3xl shadow-2xl max-w-md w-full transform transition-all duration-300 ${
        isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`}>
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          aria-label="Sluit share modal"
        >
          <X size={16} className="text-gray-600" />
        </button>

        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-brandPurple to-purple-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Share2 className="w-8 h-8 text-white" />
            </div>
            
            <h2 className="text-2xl font-medium text-gray-900 mb-2">
              Deel je Founders Club link
            </h2>
            
            <p className="text-gray-600">
              Help vrienden hun perfecte stijl te ontdekken
            </p>
          </div>

          {/* Preview */}
          <div className="bg-gray-50 rounded-2xl p-4 mb-6">
            <div className="text-sm text-gray-700">
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
              className="border-pink-300 text-pink-600 hover:bg-pink-50"
            >
              Deel op Instagram
            </Button>
            
            <Button
              variant="outline"
              fullWidth
              onClick={handleCopyLink}
              icon={<Copy size={20} />}
              iconPosition="left"
              className="border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              Kopieer Link
            </Button>
            
            <Button
              variant="primary"
              fullWidth
              onClick={handleGenericShare}
              icon={<Share2 size={20} />}
              iconPosition="left"
            >
              Meer opties
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;