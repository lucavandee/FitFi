import React, { useState } from 'react';
import { Copy, Share2, Gift, Users, Check } from 'lucide-react';
import Button from './Button';
import { useGamification } from '../../context/GamificationContext';
import { motion } from 'framer-motion';

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
    <motion.div 
      className="glass-card p-6 border border-[#0ea5e9]/20"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
    >
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 rounded-full bg-[#0ea5e9]/20">
          <Gift className="text-[#0ea5e9]" size={20} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">
            Verwijs Vrienden & Verdien
          </h3>
          <p className="text-sm text-white/70">
            Jij en je vriend krijgen allebei 50 punten!
          </p>
        </div>
      </div>
      
      {/* Referral stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white/5 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-[#0ea5e9]">
            {totalReferrals}
          </div>
          <div className="text-xs text-white/70">
            Vrienden Verwezen
          </div>
        </div>
        <div className="bg-white/5 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-[#0ea5e9]">
            {totalReferrals * 50}
          </div>
          <div className="text-xs text-white/70">
            Punten Verdiend
          </div>
        </div>
      </div>
      
      {/* Referral code */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-white/90 mb-2">
          Jouw Verwijzingscode
        </label>
        <div className="flex items-center space-x-2">
          <div className="flex-1 bg-white/5 border border-white/20 rounded-lg px-3 py-2 font-mono text-lg font-bold text-center text-white">
            {referralCode}
          </div>
          <button
            onClick={handleCopyCode}
            className={`
              p-2 rounded-lg transition-all duration-200
              ${copied 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-white/10 text-white/80 hover:bg-white/20'}
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
          variant="secondary"
          fullWidth
          onClick={handleShare}
          icon={<Share2 size={16} />}
          iconPosition="left"
        >
          Deel & Verdien 50 Punten
        </Button>
        
        <div className="text-center">
          <button className="text-sm text-[#0ea5e9] hover:text-blue-400 font-medium transition-colors flex items-center justify-center space-x-1">
            <Users size={14} />
            <span>Bekijk Verwijzingsgeschiedenis</span>
          </button>
        </div>
      </div>
      
      {/* Bonus info */}
      <div className="mt-4 p-3 bg-[#0ea5e9]/10 border border-[#0ea5e9]/20 rounded-lg">
        <p className="text-sm text-white/90 text-center">
          <strong>Bonus:</strong> Verwijs 5 vrienden en krijg 100 extra punten! 🎉
        </p>
      </div>
    </motion.div>
  );
};

export default ReferralWidget;