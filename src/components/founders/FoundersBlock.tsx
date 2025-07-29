import React, { useState, useEffect } from 'react';
import { Rocket, Copy, Check, Crown, Users, Trophy } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { supabase } from '../../lib/supabase';
import Button from '../ui/Button';
import toast from 'react-hot-toast';

interface LeaderboardEntry {
  user_id: string;
  referral_count: number;
  rank: number;
}

interface FoundersBlockProps {
  className?: string;
}

const FoundersBlock: React.FC<FoundersBlockProps> = ({ className = '' }) => {
  const { user } = useUser();
  const [referralCode, setReferralCode] = useState<string>('');
  const [referralCount, setReferralCount] = useState<number>(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadReferralData();
      loadLeaderboard();
    }
  }, [user?.id]);

  const loadReferralData = async () => {
    if (!user?.id) return;

    try {
      // Get user's referral code
      const { data: referralData, error: referralError } = await supabase
        .from('referrals')
        .select('code')
        .eq('user_id', user.id)
        .single();

      if (referralError) {
        console.error('Error loading referral code:', referralError);
        return;
      }

      if (referralData) {
        setReferralCode(referralData.code);
      }

      // Get referral count
      const { count, error: countError } = await supabase
        .from('referrals')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .not('referred_user_id', 'is', null);

      if (countError) {
        console.error('Error loading referral count:', countError);
        return;
      }

      setReferralCount(count || 0);
    } catch (error) {
      console.error('Error loading referral data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_referral_leaderboard');

      if (error) {
        console.error('Error loading leaderboard:', error);
        return;
      }

      setLeaderboard(data || []);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    }
  };

  const handleCopyLink = async () => {
    const referralUrl = `${window.location.origin}?ref=${referralCode}`;
    
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      toast.success('Referral link gekopieerd!');
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Kon link niet kopiëren');
    }
  };

  const isFoundingMember = referralCount >= 3;
  const progress = Math.min((referralCount / 3) * 100, 100);

  if (isLoading) {
    return (
      <div className={`bg-white rounded-3xl p-8 shadow-sm ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-6"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <section className={`bg-white rounded-3xl p-8 shadow-sm ${className}`} aria-labelledby="founders-heading">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Founders Club Info */}
        <div>
          <div className="flex items-center space-x-3 mb-6">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              isFoundingMember 
                ? 'bg-gradient-to-br from-brandPurple to-purple-400' 
                : 'bg-gray-100'
            }`}>
              {isFoundingMember ? (
                <Crown className="w-6 h-6 text-white" />
              ) : (
                <Rocket className="w-6 h-6 text-gray-400" />
              )}
            </div>
            <div>
              <h2 id="founders-heading" className="text-2xl font-light text-gray-900">
                FitFi Founders Club
              </h2>
              <p className="text-gray-600">
                {isFoundingMember ? 'Founding Member' : 'Word Founding Member'}
              </p>
            </div>
          </div>

          {/* Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Voortgang naar Founding Member
              </span>
              <span className="text-sm text-gray-500">
                {referralCount}/3 referrals
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-brandPurple to-purple-400 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            
            {isFoundingMember && (
              <div className="mt-3 flex items-center space-x-2 text-brandPurple">
                <Crown size={16} />
                <span className="text-sm font-medium">Gefeliciteerd! Je bent nu Founding Member</span>
              </div>
            )}
          </div>

          {/* Benefits */}
          <div className="space-y-3 mb-6">
            <h3 className="font-medium text-gray-900">Founding Member voordelen:</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-brandPurple rounded-full"></div>
                <span>Exclusieve Founding Member badge</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-brandPurple rounded-full"></div>
                <span>Vroege toegang tot nieuwe features</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-brandPurple rounded-full"></div>
                <span>Speciale community events</span>
              </li>
            </ul>
          </div>

          {/* Copy Link Button */}
          <Button
            onClick={handleCopyLink}
            variant="primary"
            icon={copied ? <Check size={16} /> : <Copy size={16} />}
            iconPosition="left"
            className="w-full"
            disabled={!referralCode}
          >
            {copied ? 'Link gekopieerd!' : 'Kopieer referral link'}
          </Button>
          
          {referralCode && (
            <p className="text-xs text-gray-500 mt-2 text-center">
              fitfi.ai?ref={referralCode}
            </p>
          )}
        </div>

        {/* Leaderboard */}
        <div>
          <div className="flex items-center space-x-2 mb-6">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-medium text-gray-900">
              Top Referrers
            </h3>
          </div>

          {leaderboard.length > 0 ? (
            <div className="space-y-3">
              {leaderboard.slice(0, 10).map((entry, index) => (
                <div 
                  key={entry.user_id}
                  className={`flex items-center justify-between p-3 rounded-xl ${
                    entry.user_id === user?.id 
                      ? 'bg-brandPurple/10 border border-brandPurple/20' 
                      : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-yellow-100 text-yellow-800' :
                      index === 1 ? 'bg-gray-100 text-gray-800' :
                      index === 2 ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                    
                    <div>
                      <div className="font-medium text-gray-900">
                        {entry.user_id === user?.id ? 'Jij' : `Member #${entry.rank}`}
                      </div>
                      {entry.referral_count >= 3 && (
                        <div className="flex items-center space-x-1 text-xs text-brandPurple">
                          <Crown size={12} />
                          <span>Founding Member</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-bold text-brandPurple">
                      {entry.referral_count}
                    </div>
                    <div className="text-xs text-gray-500">referrals</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Nog geen referrers</p>
              <p className="text-sm text-gray-400">Wees de eerste!</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FoundersBlock;