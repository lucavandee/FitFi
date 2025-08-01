import React, { useState, useRef, useEffect } from 'react';
import { Crown, Copy, Check, Users, Share2, Trophy } from 'lucide-react';
import Button from '../ui/Button';
import toast from 'react-hot-toast';

interface ReferralStats {
  total: number;
  rank: number;
  is_founding_member: boolean;
}

interface FoundersCardProps {
  referrals: ReferralStats;
  shareLink?: string;
  className?: string;
}

const FoundersCard: React.FC<FoundersCardProps> = ({ 
  referrals, 
  shareLink, 
  className = '' 
}) => {
  const [copied, setCopied] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  
  const ref = useRef<HTMLDivElement>(null);

  const progress = Math.min((referrals.total / 3) * 100, 100);

  const handleCopyLink = async () => {
    if (!shareLink) {
      toast.error('Geen referral link beschikbaar');
      return;
    }

    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      toast.success('Referral link gekopieerd!');
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Kon link niet kopiëren');
    }
  };

  const handleShare = () => {
    if (navigator.share && shareLink) {
      navigator.share({
        title: 'Word FitFi Founding Member',
        text: 'Ontdek jouw perfecte stijl met AI-powered personal styling',
        url: shareLink
      });
    } else {
      handleCopyLink();
    }
  };

  return (
    <div
      ref={ref}
      className={`bg-white rounded-3xl shadow-card p-6 animate-fade-in ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brandGradientFrom to-brandGradientTo flex items-center justify-center">
            {referrals.is_founding_member ? (
              <Crown className="w-5 h-5 text-white" />
            ) : (
              <Users className="w-5 h-5 text-white" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {referrals.is_founding_member ? 'Founding Member' : 'Founders Club'}
            </h2>
            <p className="text-gray-600 text-sm">
              {referrals.is_founding_member 
                ? 'Je hebt alle voordelen unlocked!' 
                : `${referrals.total}/3 referrals voor Founding Member`
              }
            </p>
          </div>
        </div>

        {referrals.is_founding_member && (
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-3 py-1 rounded-full text-xs font-medium animate-scale-in">
            ✨ Founding Member
          </div>
        )}
      </div>

      {/* Progress Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Progress Ring */}
        <div className="flex justify-center">
          <div className="relative w-32 h-32 animate-scale-in">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-gray-200"
              />
              
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="url(#foundersGradient)"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray="283"
                strokeDashoffset={`${283 - (283 * progress) / 100}`}
                className="transition-all duration-1000 ease-out"
              />
              
              {/* Gradient definition */}
              <defs>
                <linearGradient id="foundersGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6E2EB7" />
                  <stop offset="100%" stopColor="#B043FF" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-gray-900 animate-count-up">
                {referrals.total}
              </span>
              <span className="text-sm text-gray-600">van 3</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Jouw rank</span>
              <div className="flex items-center space-x-1">
                <Trophy className="w-4 h-4 text-yellow-500" />
                <span className="font-bold text-gray-900">#{referrals.rank}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Status</span>
              <span className={`font-medium ${
                referrals.is_founding_member ? 'text-yellow-600' : 'text-brandPurple'
              }`}>
                {referrals.is_founding_member ? 'Founding Member' : 'Member'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="bg-gradient-to-r from-brandPurple/5 to-purple-50 rounded-2xl p-4 mb-6">
        <h3 className="font-medium text-gray-900 mb-3">Founding Member voordelen:</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-center space-x-2">
            <Crown className="w-4 h-4 text-brandPurple" />
            <span>Exclusieve Founding Member badge</span>
          </li>
          <li className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-brandPurple" />
            <span>Vroege toegang tot nieuwe features</span>
          </li>
          <li className="flex items-center space-x-2">
            <Trophy className="w-4 h-4 text-brandPurple" />
            <span>Speciale community events</span>
          </li>
        </ul>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <Button
          onClick={handleCopyLink}
          variant="primary"
          className="w-full bg-gradient-to-r from-brandGradientFrom to-brandGradientTo text-white hover:shadow-lg transition-all duration-300"
          icon={copied ? <Check size={16} /> : <Copy size={16} />}
          iconPosition="left"
          disabled={!shareLink}
        >
          {copied ? 'Link gekopieerd!' : 'Kopieer referral link'}
        </Button>
        
        <Button
          onClick={handleShare}
          variant="outline"
          className="w-full border-2 border-brandPurple text-brandPurple hover:bg-brandPurple hover:text-white transition-all duration-300"
          icon={<Share2 size={16} />}
          iconPosition="left"
          disabled={!shareLink}
        >
          Deel op social media
        </Button>
      </div>

      {shareLink && (
        <p className="text-xs text-gray-500 text-center mt-4 font-mono bg-gray-50 px-3 py-2 rounded-lg">
          {shareLink.replace('https://', '')}
        </p>
      )}
    </div>
  );
};

export default FoundersCard;