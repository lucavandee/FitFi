import React, { useState, useEffect, useRef } from 'react';
import { Rocket, Copy, Check, Crown, Users, Trophy, CheckCircle, Gift } from 'lucide-react';
import { motion, useInView, useAnimation } from 'framer-motion';
import { useUser } from '../../context/UserContext';
import { supabase } from '../../lib/supabase';
import Button from '../ui/Button';
import FoundersBadge from './FoundersBadge';
import ShareModal from './ShareModal';
import { realtimeCollaboration } from '../../services/RealtimeCollaboration';
import toast from 'react-hot-toast';

interface LeaderboardEntry {
  id: string;
  username: string;
  referral_count: number;
  rank: number;
}

const FoundersBlockDashboard: React.FC = () => {
  const { user } = useUser();
  const [referralCode, setReferralCode] = useState('');
  const [referralCount, setReferralCount] = useState(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [isInView, controls]);

  useEffect(() => {
    if (user?.id) {
      // Initialize real-time collaboration
      realtimeCollaboration.setUserId(user.id);
      
      // Subscribe to real-time updates
      const unsubscribe = realtimeCollaboration.onUpdate((update) => {
        // Update leaderboard when peers share updates
        loadLeaderboard();
        
        // Show toast for real-time updates
        if (update.type === 'increment' && update.userId !== user.id) {
          toast.success(`🎉 Someone just joined the Founders Club!`);
        }
      });

      // Check for prefetched data
      const prefetchedData = sessionStorage.getItem('fitfi-prefetched-founders');
      if (prefetchedData) {
        try {
          const { data, timestamp } = JSON.parse(prefetchedData);
          
          // Use prefetched data if less than 5 minutes old
          if (Date.now() - timestamp < 300000) {
            setReferralCode(data.referralCode || '');
            setLeaderboard(data.leaderboard || []);
            setIsLoading(false);
            
            // Clear prefetched data
            sessionStorage.removeItem('fitfi-prefetched-founders');
            
            console.log('[⚡ FoundersBlockDashboard] Using prefetched data for instant load');
            return unsubscribe;
          }
        } catch (error) {
          console.warn('Failed to parse prefetched data:', error);
        }
      }

      loadReferralData();
      loadLeaderboard();
      
      return unsubscribe;
    }
  }, [user?.id]);

  const loadReferralData = async () => {
    if (!user?.id) return;

    try {
      // Get or create referral code
      let { data: profile, error } = await supabase
        .from('profiles')
        .select('referral_code')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      let code = profile?.referral_code;
      
      if (!code) {
        // Generate new referral code
        code = `FITFI${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ referral_code: code })
          .eq('id', user.id);

        if (updateError) throw updateError;
      }

      setReferralCode(code);

      // Get referral count
      const { count, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('referred_by', user.id);

      if (countError) {
        throw countError;
      }

      setReferralCount(count || 0);
      
      // Broadcast update to peers
      realtimeCollaboration.broadcastUpdate({
        userId: user.id,
        referralCount: count || 0,
        timestamp: Date.now(),
        type: 'increment'
      });
      
    } catch (error) {
      console.error('Error loading referral data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          username,
          referral_count
        `)
        .not('referral_count', 'is', null)
        .gt('referral_count', 0)
        .order('referral_count', { ascending: false })
        .limit(10);

      if (error) throw error;

      const leaderboardWithRanks = data?.map((entry, index) => ({
        ...entry,
        rank: index + 1
      })) || [];

      setLeaderboard(leaderboardWithRanks);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    }
  };

  const copyReferralLink = async () => {
    const referralLink = `${window.location.origin}/signup?ref=${referralCode}`;
    
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast.success('Referral link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy link');
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Trophy className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Trophy className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-400">#{rank}</span>;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <motion.div
        ref={ref}
        variants={containerVariants}
        initial="hidden"
        animate={controls}
        className="container mx-auto px-4 py-8"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Rocket className="w-12 h-12 text-purple-400 mr-4" />
            <h1 className="text-4xl md:text-6xl font-bold text-white">
              Founders Block
            </h1>
          </div>
          <p className="text-xl text-purple-200 max-w-2xl mx-auto">
            Join the exclusive Founders Club and earn rewards for growing the FitFi community
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Referral Stats */}
          <motion.div variants={itemVariants} className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Your Progress</h2>
              <FoundersBadge count={referralCount} />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-purple-200">Referrals</span>
                <span className="text-3xl font-bold text-white">{referralCount}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-purple-200">Rewards Earned</span>
                <span className="text-2xl font-bold text-green-400">${(referralCount * 10).toFixed(2)}</span>
              </div>

              {referralCount >= 10 && (
                <div className="flex items-center text-green-400 bg-green-400/20 rounded-lg p-3">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  <span className="font-semibold">Founders Club Member!</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Referral Code */}
          <motion.div variants={itemVariants} className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6">Share & Earn</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-purple-200 mb-2">Your Referral Code</label>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-black/30 rounded-lg p-3 font-mono text-white text-lg">
                    {referralCode}
                  </div>
                  <Button
                    onClick={copyReferralLink}
                    variant="secondary"
                    className="p-3"
                  >
                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </Button>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={copyReferralLink}
                  className="flex-1"
                  variant="primary"
                >
                  Copy Link
                </Button>
                <Button
                  onClick={() => setShowShareModal(true)}
                  variant="secondary"
                  className="flex-1"
                >
                  Share
                </Button>
              </div>

              <div className="text-sm text-purple-200 bg-purple-500/20 rounded-lg p-3">
                <Gift className="w-4 h-4 inline mr-2" />
                Earn $10 for each person who joins using your code!
              </div>
            </div>
          </motion.div>
        </div>

        {/* Leaderboard */}
        <motion.div variants={itemVariants} className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <Users className="w-6 h-6 mr-2" />
              Leaderboard
            </h2>
            <span className="text-purple-200">Top Referrers</span>
          </div>

          <div className="space-y-3">
            {leaderboard.map((entry, index) => (
              <motion.div
                key={entry.id}
                variants={itemVariants}
                className={`flex items-center justify-between p-4 rounded-lg ${
                  entry.id === user?.id 
                    ? 'bg-purple-500/30 border border-purple-400/50' 
                    : 'bg-white/5'
                }`}
              >
                <div className="flex items-center space-x-4">
                  {getRankIcon(entry.rank)}
                  <div>
                    <div className="font-semibold text-white">
                      {entry.username || 'Anonymous'}
                      {entry.id === user?.id && (
                        <span className="ml-2 text-xs bg-purple-500 text-white px-2 py-1 rounded-full">
                          You
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-white">
                    {entry.referral_count}
                  </div>
                  <div className="text-sm text-purple-200">referrals</div>
                </div>
              </motion.div>
            ))}
          </div>

          {leaderboard.length === 0 && (
            <div className="text-center py-8 text-purple-200">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Be the first to appear on the leaderboard!</p>
            </div>
          )}
        </motion.div>

        {/* How it Works */}
        <motion.div variants={itemVariants} className="mt-12 bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">How It Works</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-400">1</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Share Your Code</h3>
              <p className="text-purple-200">Share your unique referral code with friends and family</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-400">2</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">They Join</h3>
              <p className="text-purple-200">When someone signs up using your code, you both benefit</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-400">3</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Earn Rewards</h3>
              <p className="text-purple-200">Get $10 per referral and exclusive Founders Club benefits</p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        referralCode={referralCode}
      />
    </div>
  );
};

export default FoundersBlockDashboard;