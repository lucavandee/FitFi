import React, { createContext, useContext, useState, useEffect } from "react";
import { useUser } from "./UserContext";
import gamificationConfig from "../config/gamification.json";
import {
  getGamificationData,
  updateGamificationData,
  completeChallenge as completeDataRouterChallenge,
  getDailyChallengesData,
} from "../services/DataRouter";
import toast from "react-hot-toast";

interface GamificationState {
  points: number;
  level: string;
  badges: string[];
  streak: number;
  dailyChallengeStatus: Record<string, boolean>;
  referralCode: string;
  lastCheckIn: string | null;
  completedChallenges: string[];
  totalReferrals: number;
  seasonalEventProgress: Record<string, any>;
}

interface GamificationContextType {
  points: number;
  level: string;
  currentLevelInfo: any;
  nextLevelInfo: any;
  badges: string[];
  earnedBadges: any[];
  streak: number;
  dailyChallengeStatus: Record<string, boolean>;
  availableChallenges: any[];
  referralCode: string;
  totalReferrals: number;
  isLoading: boolean;

  completeQuiz: () => Promise<void>;
  makePurchase: (amount?: number) => Promise<void>;
  checkIn: () => Promise<void>;
  completeChallenge: (challengeId: string) => Promise<void>;
  recordReferral: () => Promise<void>;
  viewRecommendation: () => Promise<void>;
  shareOutfit: () => Promise<void>;
  saveOutfit: () => Promise<void>;

  getPointsForAction: (action: string) => number;
  canEarnBadge: (badgeId: string) => boolean;
  getProgressToNextLevel: () => number;
  isSeasonalEventActive: () => boolean;
  getSeasonalMultiplier: () => number;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export const GamificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [availableChallenges, setAvailableChallenges] = useState<any[]>([]);

  const [gamificationState, setGamificationState] = useState<GamificationState>({
    points: 0,
    level: "beginner",
    badges: [],
    streak: 0,
    dailyChallengeStatus: {},
    referralCode: generateReferralCode(),
    lastCheckIn: null,
    completedChallenges: [],
    totalReferrals: 0,
    seasonalEventProgress: {},
  });

  useEffect(() => {
    if (user?.id) {
      loadGamificationState();
    } else {
      resetGamificationState();
    }
  }, [user]);

  const resetGamificationState = () => {
    setGamificationState({
      points: 0,
      level: "beginner",
      badges: [],
      streak: 0,
      dailyChallengeStatus: {},
      referralCode: generateReferralCode(),
      lastCheckIn: null,
      completedChallenges: [],
      totalReferrals: 0,
      seasonalEventProgress: {},
    });
    setIsLoading(false);
  };

  const loadGamificationState = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const data = await getGamificationData(user.id);
      const dailyChallenges = await getDailyChallengesData(user.id);

      setGamificationState({
        ...data,
        dailyChallengeStatus: dailyChallenges,
      });

      setAvailableChallenges(
        Array.isArray(gamificationConfig.challenges) ? gamificationConfig.challenges.filter(
          (ch) => !data.completedChallenges.includes(ch.id)
        ) : []
      );
    } catch (err) {
      console.error("[⚠️ Gamification] Fout bij laden van data:", err);
      toast.error("Kon gamificatiegegevens niet laden.");
    } finally {
      setIsLoading(false);
    }
  };

  const updatePoints = async (points: number) => {
    if (!user?.id) return;
    const newPoints = gamificationState.points + points;
    await updateGamificationData(user.id, { points: newPoints });
    setGamificationState((prev) => ({ ...prev, points: newPoints }));
  };

  const completeChallenge = async (challengeId: string) => {
    if (!user?.id) return;

    try {
      await completeDataRouterChallenge(user.id, challengeId);
      toast.success("✅ Challenge voltooid!");

      setGamificationState((prev) => ({
        ...prev,
        completedChallenges: [...prev.completedChallenges, challengeId],
        points: prev.points + getPointsForAction("challenge"),
      }));
    } catch (err) {
      console.error("❌ Challenge voltooiing mislukt:", err);
      toast.error("Challenge kon niet worden voltooid.");
    }
  };

  // Acties
  const completeQuiz = () => updatePoints(getPointsForAction("quiz"));
  const makePurchase = (amount = 1) => updatePoints(getPointsForAction("purchase") * amount);
  const checkIn = () => updatePoints(getPointsForAction("checkin"));
  const recordReferral = () => updatePoints(getPointsForAction("referral"));
  const viewRecommendation = () => updatePoints(getPointsForAction("view"));
  const shareOutfit = () => updatePoints(getPointsForAction("share"));
  const saveOutfit = () => updatePoints(getPointsForAction("save"));

  // Helpers
  const getPointsForAction = (action: string): number => {
    return gamificationConfig.actions?.[action]?.points || 0;
  };

  const canEarnBadge = (badgeId: string): boolean => {
    return !gamificationState.badges.includes(badgeId);
  };

  const getProgressToNextLevel = (): number => {
    const current = gamificationConfig.levels.find((l) => l.id === gamificationState.level);
    const next = gamificationConfig.levels.find((l) => l.rank === (current?.rank || 0) + 1);

    if (!current || !next) return 0;

    const range = next.minPoints - current.minPoints;
    const progress = gamificationState.points - current.minPoints;
    return Math.min(100, Math.round((progress / range) * 100));
  };

  const isSeasonalEventActive = () => true; // TODO: Replace with real logic
  const getSeasonalMultiplier = () => 1; // TODO: Replace with real logic

  const currentLevelInfo = gamificationConfig.levels.find((l) => l.id === gamificationState.level);
  const nextLevelInfo = gamificationConfig.levels.find(
    (l) => l.rank === (currentLevelInfo?.rank || 0) + 1
  );
  const earnedBadges = (gamificationConfig.badges || []).filter((b) =>
    gamificationState.badges.includes(b.id)
  );

  return (
    <GamificationContext.Provider
      value={{
        ...gamificationState,
        availableChallenges,
        isLoading,
        completeQuiz,
        makePurchase,
        checkIn,
        completeChallenge,
        recordReferral,
        viewRecommendation,
        shareOutfit,
        saveOutfit,
        getPointsForAction,
        canEarnBadge,
        getProgressToNextLevel,
        isSeasonalEventActive,
        getSeasonalMultiplier,
        currentLevelInfo,
        nextLevelInfo,
        earnedBadges,
      }}
    >
      {children}
    </GamificationContext.Provider>
  );
};

export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error("useGamification must be used within a GamificationProvider");
  }
  return context;
};

function generateReferralCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}
