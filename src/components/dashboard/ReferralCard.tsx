import React, { useState } from 'react';
import { Crown, Copy, Check, Share2, MessageCircle, Linkedin, Users } from 'lucide-react';
import Button from '../ui/Button';
import { track } from '@/utils/analytics';
import toast from 'react-hot-toast';

interface ReferralCardProps {
  codeUrl: string;
  count: number;
  goal?: number;
  className?: string;
}

const ReferralCard: React.FC<ReferralCardProps> = ({ 
  codeUrl, 
  count, 
  goal = 3, 
  className = '' 
}) => {
  const [copied, setCopied] = useState(false);
  const progress = Math.min((count / goal) * 100, 100);
  const isFoundingMember = count >= goal;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(codeUrl);
      setCopied(true);
      toast.success('Referral link gekopieerd!');
      
      track('referral_copy', {
        referral_count: count,
        goal_progress: count / goal,
        source: 'dashboard_referral_card'
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Kon link niet kopiëren');
    }
  };

  const handleWhatsAppShare = () => {
    const message = encodeURIComponent(`Hey! Ik gebruik FitFi voor AI-powered styling advies. Probeer het ook: ${codeUrl}`);
    window.open(`https://wa.me/?text=${message}`, '_blank');
    
    track('referral_share', {
      platform: 'whatsapp',
      referral_count: count,
      source: 'dashboard'
    });
  };

  const handleLinkedInShare = () => {
    const url = encodeURIComponent(codeUrl);
    const text = encodeURIComponent('Ontdek jouw perfecte stijl met AI-powered personal styling op FitFi!');
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}&summary=${text}`, '_blank');
    
    track('referral_share', {
      platform: 'linkedin',
      referral_count: count,
      source: 'dashboard'
    });
  };

  const handleGenericShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Word FitFi Founding Member',
          text: 'Ontdek jouw perfecte stijl met AI-powered personal styling',
          url: codeUrl
        });
        
        track('referral_share', {
          platform: 'native_share',
          referral_count: count,
          source: 'dashboard'
        });
      } catch (error) {
        // User cancelled or error occurred
        console.log('Share cancelled');
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className={`bg-white rounded-3xl shadow-sm p-6 hover:shadow-md transition-all ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isFoundingMember 
              ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' 
              : 'bg-gradient-to-br from-purple-500 to-purple-600'
          }`}>
            {isFoundingMember ? (
              <Crown className="w-5 h-5 text-white" />
            ) : (
              <Users className="w-5 h-5 text-white" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-medium text-[#0D1B2A]">
              {isFoundingMember ? 'Founding Member' : 'Founders Club'}
            </h3>
            <p className="text-gray-600 text-sm">
              {isFoundingMember 
                ? 'Je hebt alle voordelen unlocked!' 
                : 'Nodig vrienden uit voor exclusieve voordelen'
              }
            </p>
          </div>
        </div>

        {isFoundingMember && (
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-3 py-1 rounded-full text-xs font-medium animate-pulse">
            ✨ Founding Member
          </div>
        )}
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">Voortgang</span>
          <span className="font-medium text-[#0D1B2A]">{count}/{goal} referrals</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ease-out ${
              isFoundingMember 
                ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' 
                : 'bg-gradient-to-r from-purple-500 to-purple-600'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Benefits Preview */}
      {!isFoundingMember && (
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl p-4 mb-6">
          <h4 className="font-medium text-purple-900 mb-2">Founding Member voordelen:</h4>
          <ul className="space-y-1 text-sm text-purple-800">
            <li>• Exclusieve Founding Member badge</li>
            <li>• Vroege toegang tot nieuwe features</li>
            <li>• Speciale community events</li>
          </ul>
        </div>
      )}

      {/* Share Actions */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={handleWhatsAppShare}
            variant="outline"
            size="sm"
            icon={<MessageCircle size={16} />}
            iconPosition="left"
            className="border-green-300 text-green-600 hover:bg-green-50"
          >
            WhatsApp
          </Button>
          
          <Button
            onClick={handleLinkedInShare}
            variant="outline"
            size="sm"
            icon={<Linkedin size={16} />}
            iconPosition="left"
            className="border-blue-300 text-blue-600 hover:bg-blue-50"
          >
            LinkedIn
          </Button>
        </div>
        
        <Button
          onClick={handleCopyLink}
          variant="primary"
          size="lg"
          fullWidth
          icon={copied ? <Check size={18} /> : <Copy size={18} />}
          iconPosition="left"
          className="bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all"
        >
          {copied ? 'Link gekopieerd!' : 'Kopieer referral link'}
        </Button>
        
        <Button
          onClick={handleGenericShare}
          variant="outline"
          size="sm"
          fullWidth
          icon={<Share2 size={16} />}
          iconPosition="left"
          className="border-gray-300 text-gray-600 hover:bg-gray-50"
        >
          Meer opties
        </Button>
      </div>

      {/* Referral Code Display */}
      <div className="mt-4 p-3 bg-gray-50 rounded-2xl">
        <div className="text-xs text-gray-500 mb-1">Jouw referral code:</div>
        <div className="font-mono text-sm text-[#0D1B2A] break-all">
          {codeUrl.split('?ref=')[1] || 'FITFI2025'}
        </div>
      </div>
    </div>
  );
};

export default ReferralCard;