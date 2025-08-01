import React, { useState, useEffect, useRef } from 'react';
import { Rocket, Copy, Check, Crown, Users, Trophy, CheckCircle, Gift } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { supabase } from '../../lib/supabase';
import Button from '../ui/Button';
import FoundersBadge from './FoundersBadge';
import ShareModal from './ShareModal';
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
  const [showShareModal, setShowShareModal] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  
  const progressRef = useRef<HTMLDivElement>(null);
  const leaderboardRef = useRef<HTMLDivElement>(null);
  const isProgressInView = useInView(progressRef, { once: true, threshold: 0.3 });
  const isLeaderboardInView = useInView(leaderboardRef, { once: true, threshold: 0.3 });
  
  const progressControls = useAnimation();
  const leaderboardControls = useAnimation();

  useEffect(() => {

  const loadReferralData = async () => {
    if (!user?.id) return;

    try {
      // Get user's referral code from profiles table
      const { data: referralData, error: referralError } = await supabase
        .from('profiles')
        .select('referral_code')
        .eq('id', user.id)
        .maybeSingle();

      if (referralError) {
        console.error('Error loading referral code:', referralError);
        return;
      }

      if (referralData?.referral_code) {
        setReferralCode(referralData.referral_code);
      } else {
        // Generate new referral code if none exists
        const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ referral_code: newCode })
          .eq('id', user.id);

        if (updateError) {
          console.error('Error creating referral code:', updateError);
          return;
        }

        setReferralCode(newCode);
      }

      // Get referral count
      const { count, error: countError } = await supabase  
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('referred_by', user.id);

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

  const handleShare = () => {
    setShowShareModal(true);
  };

  const isFoundingMember = referralCount >= 3;
  const progress = Math.min((referralCount / 3) * 100, 100);

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (isLoading) {
    return (
      <div className={`max-w-4xl mx-auto ${className}`}>
        <div className="bg-foundersCardBg dark:bg-foundersCardBgDark rounded-3xl shadow-founders dark:shadow-founders-dark p-8 animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-6"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <section 
        className={`max-w-4xl mx-auto ${className}`} 
        aria-labelledby="founders-heading"
      >
        <div className="bg-foundersCardBg dark:bg-foundersCardBgDark rounded-3xl shadow-founders dark:shadow-founders-dark p-6 md:p-8 xl:p-12 transition-colors duration-300 animate-slide-up">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Progress Section */}
            <div 
              ref={progressRef}
              className="space-y-6 animate-fade-in"
            >
              {/* Header */}
              <div className="text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start space-x-3 mb-4">
                  <div className="relative">
                    {isFoundingMember ? (
                      <div className="animate-scale-in">
                        <FoundersBadge size="lg" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-foundersGradientFrom to-foundersGradientTo flex items-center justify-center">
                        <Rocket className="w-6 h-6 text-white" />
                      </div>
                    )}
                    
                    {/* Tooltip */}
                    {showTooltip && isFoundingMember && (
                      <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-1 rounded-lg whitespace-nowrap animate-fade-in">
                        Founding Member unlocked!
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h2 id="founders-heading" className="font-display text-2xl lg:text-3xl font-bold text-gray-900 dark:text-neutral-100">
                      FitFi Founders Club
                    </h2>
                    <p className="text-gray-600 dark:text-neutral-300">
                      {isFoundingMember ? 'Founding Member' : 'Word Founding Member'}
                    </p>
                  </div>
                </div>
                
                <p className="text-gray-600 dark:text-neutral-300 mb-6">
                  Nodig 3 vrienden uit om Founding Member te worden en krijg exclusieve voordelen.
                </p>
              </div>

              {/* Progress Ring */}
              <div className="flex justify-center lg:justify-start">
                <div className="relative w-32 h-32">
                  <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                    {/* Background circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-gray-200 dark:text-gray-700"
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
                    <span className="text-2xl font-bold text-gray-900 dark:text-neutral-100 animate-count-up">
                      {referralCount}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-neutral-300">van 3</span>
                  </div>
                </div>
              </div>

              {/* Benefits */}
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900 dark:text-neutral-100 flex items-center">
                  <Gift className="w-4 h-4 mr-2 text-foundersGradientFrom" />
                  Founding Member voordelen:
                </h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-neutral-300">
                  {[
                    'Exclusieve Founding Member badge',
                    'Vroege toegang tot nieuwe features',
                    'Speciale community events'
                  ].map((benefit, index) => (
                    <li 
                      key={index}
                      className="flex items-center space-x-2 animate-slide-up"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <CheckCircle className="w-4 h-4 text-foundersGradientFrom flex-shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={handleCopyLink}
                  variant="primary"
                  className="w-full bg-gradient-to-r from-foundersGradientFrom to-foundersGradientTo text-white hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] focus:ring-2 focus:ring-foundersGradientFrom focus:ring-offset-2"
                  icon={copied ? <Check size={16} /> : <Copy size={16} />}
                  iconPosition="left"
                  disabled={!referralCode}
                  aria-label={copied ? 'Link gekopieerd' : 'Kopieer referral link'}
                >
                  {copied ? 'Link gekopieerd!' : 'Kopieer referral link'}
                </Button>
                
                <Button
                  onClick={handleShare}
                  variant="outline"
                  className="w-full border-2 border-foundersGradientFrom text-foundersGradientFrom hover:bg-foundersGradientFrom hover:text-white transition-all duration-300"
                  disabled={!referralCode}
                >
                  Deel op social media
                </Button>
              </div>
              
              {referralCode && (
                <p className="text-xs text-gray-500 dark:text-neutral-400 text-center font-mono bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-lg">
                  fitfi.ai?ref={referralCode}
                </p>
              )}
            </div>

            {/* Leaderboard Section */}
            <div 
              ref={leaderboardRef}
              className="space-y-6 animate-slide-in-right"
            >
              <div className="flex items-center space-x-2 mb-6">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <h3 className="font-display text-lg font-semibold text-gray-900 dark:text-neutral-100">
                  Top Referrers
                </h3>
              </div>

              {leaderboard.length > 0 ? (
                <div className="backdrop-blur-md bg-white/60 dark:bg-white/10 rounded-2xl p-4 border border-white/20">
                  <div className="space-y-3">
                    {leaderboard.slice(0, 10).map((entry, index) => (
                      <div 
                        key={entry.user_id}
                        className={`flex items-center justify-between p-3 rounded-xl transition-all duration-300 animate-slide-up ${
                          entry.user_id === user?.id 
                            ? 'bg-gradient-to-r from-foundersGradientFrom/10 to-foundersGradientTo/10 border border-foundersGradientFrom/20' 
                            : 'bg-white/40 dark:bg-white/5 hover:bg-white/60 dark:hover:bg-white/10'
                        }`}
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                            index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-lg' :
                            index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white shadow-md' :
                            index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-md' :
                            'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                          }`}>
                            {index === 0 ? <Crown size={14} /> : index + 1}
                          </div>
                          
                          <div>
                            <div className="font-medium text-gray-900 dark:text-neutral-100">
                              {entry.user_id === user?.id ? 'Jij' : `Member #${entry.rank}`}
                            </div>
                            {entry.referral_count >= 3 && (
                              <div className="flex items-center space-x-1 text-xs text-foundersGradientFrom">
                                <Crown size={12} />
                                <span>Founding Member</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="font-bold text-foundersGradientFrom text-lg animate-count-up">
                            {entry.referral_count}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-neutral-400">referrals</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 backdrop-blur-md bg-white/60 dark:bg-white/10 rounded-2xl border border-white/20">
                  <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-neutral-400">Nog geen referrers</p>
                  <p className="text-sm text-gray-400 dark:text-neutral-500">Wees de eerste!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal
          referralCode={referralCode}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </>
  );
};

export default FoundersBlock;