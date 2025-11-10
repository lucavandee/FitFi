import React, { createContext, useContext, useState, useCallback } from 'react';
import { AchievementToast, LevelUpToast, XPToast, Achievement } from '@/components/notifications/AchievementToast';

interface NotificationContextValue {
  showAchievement: (achievement: Achievement) => void;
  showLevelUp: (level: number, levelName: string, levelIcon: string) => void;
  showXP: (amount: number, reason: string) => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [achievement, setAchievement] = useState<Achievement | null>(null);
  const [levelUp, setLevelUp] = useState<{ level: number; levelName: string; levelIcon: string } | null>(null);
  const [xpGain, setXpGain] = useState<{ amount: number; reason: string } | null>(null);

  const showAchievement = useCallback((achievement: Achievement) => {
    setAchievement(achievement);
  }, []);

  const showLevelUp = useCallback((level: number, levelName: string, levelIcon: string) => {
    setLevelUp({ level, levelName, levelIcon });
  }, []);

  const showXP = useCallback((amount: number, reason: string) => {
    setXpGain({ amount, reason });
  }, []);

  return (
    <NotificationContext.Provider value={{ showAchievement, showLevelUp, showXP }}>
      {children}

      {/* Render notifications */}
      {achievement && (
        <AchievementToast
          achievement={achievement}
          onClose={() => setAchievement(null)}
        />
      )}

      {levelUp && (
        <LevelUpToast
          level={levelUp.level}
          levelName={levelUp.levelName}
          levelIcon={levelUp.levelIcon}
          onClose={() => setLevelUp(null)}
        />
      )}

      {xpGain && (
        <XPToast
          amount={xpGain.amount}
          reason={xpGain.reason}
          onClose={() => setXpGain(null)}
        />
      )}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}
