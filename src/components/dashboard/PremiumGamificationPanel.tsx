import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";
import { Trophy, Zap, Crown, Award, ArrowRight, Target, Star } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface GamificationStats {
  total_xp: number;
  current_level: number;
  achievements_count: number;
  daily_streak: number;
  outfits_saved: number;
}

interface PremiumGamificationPanelProps {
  userId?: string;
}

export function PremiumGamificationPanel({ userId }: PremiumGamificationPanelProps) {
  const [stats, setStats] = useState<GamificationStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        const client = supabase();
        if (!client) return;

        const { data, error } = await client
          .from("user_gamification")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setStats(data as GamificationStats);
        } else {
          setStats({
            total_xp: 0,
            current_level: 1,
            achievements_count: 0,
            daily_streak: 0,
            outfits_saved: 0,
          });
        }
      } catch (error) {
        console.error("Error fetching gamification stats:", error);
        setStats({
          total_xp: 0,
          current_level: 1,
          achievements_count: 0,
          daily_streak: 0,
          outfits_saved: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userId]);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-3xl p-8 shadow-xl border-2 border-purple-200 dark:border-purple-800 animate-pulse">
        <div className="h-8 w-48 bg-purple-200 dark:bg-purple-800 rounded mb-6" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-white/50 dark:bg-gray-800/50 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const xpToNextLevel = 1000;
  const currentLevelXP = stats ? stats.total_xp % xpToNextLevel : 0;
  const xpProgress = (currentLevelXP / xpToNextLevel) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-3xl p-8 shadow-xl border-2 border-purple-200 dark:border-purple-800 overflow-hidden"
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-400/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-400/10 rounded-full blur-3xl" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white shadow-lg">
              <Trophy className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-[var(--color-text)]">
                Jouw <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Progressie</span>
              </h2>
              <p className="text-[var(--color-muted)]">
                Verdien XP, unlock achievements en level up je style
              </p>
            </div>
          </div>
        </div>

        {/* Level Progress Ring */}
        <div className="mb-6 flex items-center justify-center">
          <div className="relative">
            <svg width="200" height="200" className="transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="var(--color-border)"
                strokeWidth="12"
                opacity="0.2"
              />
              {/* Progress circle */}
              <motion.circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 80}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 80 }}
                animate={{
                  strokeDashoffset: 2 * Math.PI * 80 * (1 - xpProgress / 100),
                }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#9333ea" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
            </svg>

            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Crown className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-1" />
              <div className="text-4xl font-bold text-[var(--color-text)]">
                {stats?.current_level || 1}
              </div>
              <div className="text-sm text-[var(--color-muted)] font-medium">
                Level
              </div>
            </div>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="mb-6 text-center">
          <div className="flex items-center justify-between text-sm text-[var(--color-muted)] mb-2">
            <span>{currentLevelXP.toLocaleString()} XP</span>
            <span>{xpToNextLevel.toLocaleString()} XP</span>
          </div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${xpProgress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
          <p className="text-xs text-[var(--color-muted)] mt-2">
            {(xpToNextLevel - currentLevelXP).toLocaleString()} XP tot level {(stats?.current_level || 1) + 1}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatBubble
            icon={<Zap className="w-5 h-5" />}
            label="Total XP"
            value={stats?.total_xp.toLocaleString() || "0"}
            color="purple"
          />
          <StatBubble
            icon={<Award className="w-5 h-5" />}
            label="Achievements"
            value={`${stats?.achievements_count || 0}/24`}
            color="pink"
          />
          <StatBubble
            icon={<Star className="w-5 h-5" />}
            label="Streak"
            value={`${stats?.daily_streak || 0}d`}
            color="purple"
          />
        </div>

        {/* CTA Button */}
        <NavLink
          to="/profile"
          className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg hover:shadow-xl hover:scale-105 w-full sm:w-auto group"
        >
          <Target className="w-5 h-5" />
          Bekijk volledige stats
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </NavLink>
      </div>
    </motion.div>
  );
}

function StatBubble({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: "purple" | "pink";
}) {
  const bgClass = color === "purple"
    ? "bg-white/80 dark:bg-purple-900/40"
    : "bg-white/80 dark:bg-pink-900/40";
  const iconColorClass = color === "purple"
    ? "text-purple-600 dark:text-purple-400"
    : "text-pink-600 dark:text-pink-400";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      className={`${bgClass} backdrop-blur-sm rounded-2xl p-4 border border-white/50 dark:border-gray-700/50 shadow-sm hover:shadow-md transition-all`}
    >
      <div className={`flex items-center gap-2 mb-2 ${iconColorClass}`}>
        {icon}
        <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">
          {label}
        </span>
      </div>
      <div className="text-2xl font-bold text-[var(--color-text)]">
        {value}
      </div>
    </motion.div>
  );
}
