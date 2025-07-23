import React, { useState } from 'react';
import { Share2, Copy, Check, Gift, Users } from 'lucide-react';
import Button from './Button';

interface ReferralWidgetProps {
  referralCode: string;
  referralCount: number;
  referralReward: number;
  className?: string;
}

const ReferralWidget: React.FC<ReferralWidgetProps> = ({
  referralCode,
  referralCount,
  referralReward,
  className = ''
}) => {
  const [copied, setCopied] = useState(false);

  const referralUrl = `https://fitfi.app/register?ref=${referralCode}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'FitFi - AI Style Recommendations',
          text: 'Ontdek je perfecte stijl met AI! Krijg gepersonaliseerde outfit aanbevelingen.',
          url: referralUrl
        });
      } catch (err) {
        console.error('Failed to share:', err);
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className={`bg-accent text-text-dark p-6 rounded-2xl shadow-lg ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          <Gift className="text-secondary mr-2" size={20} />
          Vrienden uitnodigen
        </h3>
        <div className="flex items-center space-x-1 text-secondary">
          <Users size={16} />
          <span className="font-bold">{referralCount}</span>
        </div>
      </div>
      
      <p className="text-gray-600 mb-4">
        Nodig vrienden uit en verdien €{referralReward} voor elke succesvolle registratie!
      </p>
      
      <div className="bg-gray-50 p-3 rounded-lg mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 truncate flex-1 mr-2">
            {referralUrl}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyLink}
            icon={copied ? <Check size={16} /> : <Copy size={16} />}
            iconPosition="left"
          >
            {copied ? 'Gekopieerd!' : 'Kopiëren'}
          </Button>
        </div>
      </div>
      
      <div className="flex space-x-2">
        <Button
          variant="primary"
          size="sm"
          onClick={handleShare}
          icon={<Share2 size={16} />}
          iconPosition="left"
          className="flex-1"
        >
          Delen
        </Button>
        
        <Button
          variant="secondary"
          size="sm"
          onClick={handleCopyLink}
          icon={<Copy size={16} />}
          iconPosition="left"
          className="flex-1"
        >
          Link kopiëren
        </Button>
      </div>
      
      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-green-700 text-sm">
          💰 Je hebt al €{referralCount * referralReward} verdiend met referrals!
        </p>
      </div>
    </div>
  );
};

export default ReferralWidget;