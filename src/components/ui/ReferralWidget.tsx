import React, { useState } from 'react';
import { Copy, Share2, Gift, Users, Check } from 'lucide-react';
import Button from './Button';
import { useGamification } from '../../context/GamificationContext';

const ReferralWidget: React.FC = () => {
  const { referralCode, totalReferrals } = useGamification();
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      // Track copy action
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'referral_code_copy', {
          event_category: 'gamification',
          event_label: 'copy_referral_code'
        });
      }
    } catch (error) {
      console.error('Failed to copy referral code:', error);
    }
  };

  const handleShare = async () => {
    const shareText = `Ontdek je perfecte stijl met FitFi! 🎨✨ Gebruik mijn code ${referralCode} en krijg 50 punten bonus. https://fitfi.app?ref=${referralCode}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'FitFi - AI Stijl Aanbevelingen',
          text: shareText,
          url: `https://fitfi.app?ref=${referralCode}`
        });
        
        // Track share action
        if (typeof window.gtag === 'function') {
          window.gtag('event', 'referral_share', {
            event_category: 'gamification',
            event_label: 'native_share'
          });
        }
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback to copying share text
      try {
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy share text:', error);
      }
    }
  };

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800 transition-colors">
      <div className="flex items-center space-x-3 mb-4">
        <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
          <Gift className="text-green-600 dark:text-green-400" size={20} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Verwijs Vrienden & Verdien
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Jij en je vriend krijgen allebei 50 punten!
          </p>
        </div>
      </div>
      
      {/* Referral stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {totalReferrals}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Vrienden Verwezen
          </div>
        </div>
        <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {totalReferrals * 50}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Punten Verdiend
          </div>
        </div>
      </div>
      
      {/* Referral code */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Jouw Verwijzingscode
        </label>
        <div className="flex items-center space-x-2">
          <div className="flex-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 font-mono text-lg font-bold text-center text-gray-900 dark:text-white">
            {referralCode}
          </div>
          <button
            onClick={handleCopyCode}
            className={`
              p-2 rounded-lg transition-all duration-200
              ${copied 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'}
            `}
            aria-label={copied ? 'Gekopieerd!' : 'Kopieer verwijzingscode'}
          >
            {copied ? <Check size={20} /> : <Copy size={20} />}
          </button>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="space-y-3">
        <Button
          variant="primary"
          fullWidth
          onClick={handleShare}
          icon={<Share2 size={16} />}
          iconPosition="left"
          className="bg-green-600 hover:bg-green-700 border-green-600 hover:border-green-700"
        >
          Deel & Verdien 50 Punten
        </Button>
        
        <div className="text-center">
          <button className="text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium transition-colors flex items-center justify-center space-x-1">
            <Users size={14} />
            <span>Bekijk Verwijzingsgeschiedenis</span>
          </button>
        </div>
      </div>
      
      {/* Bonus info */}
      <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
        <p className="text-sm text-green-700 dark:text-green-300 text-center">
          <strong>Bonus:</strong> Verwijs 5 vrienden en krijg 100 extra punten! 🎉
        </p>
      </div>
    </div>
  );
};

export default ReferralWidget;