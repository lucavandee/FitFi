import React from "react";

export const GamificationPanel: React.FC<{
  level?: number;
  xp?: number;
  streak?: number;
  loading?: boolean;
}> = ({ level, xp, streak = 0, loading = false }) => {
  // Loading skeleton
  if (loading || level === undefined || xp === undefined) {
    return (
      <div className="bg-white rounded-2xl p-4 shadow animate-pulse">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-3 bg-gray-200 rounded w-16 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-12 mb-1"></div>
            <div className="h-2 bg-gray-200 rounded w-24"></div>
          </div>
          <div className="flex flex-col items-end">
            <div className="w-36 h-2 bg-gray-200 rounded-full mb-2"></div>
            <div className="h-2 bg-gray-200 rounded w-20"></div>
          </div>
        </div>
      </div>
    );
  }

  const nextLv = Math.max(100, Math.ceil((level + 1) * 100)); // simple curve
  const pct = Math.min(100, Math.round(((xp % nextLv) / nextLv) * 100));
  return (
        <div className="bg-light-gray rounded-lg p-4">
      <div>
        <div className="text-sm text-gray-500">Jouw level</div>
            <span className="text-sm font-medium text-midnight/70">Level</span>
        <div className="text-xs text-gray-500 mt-1">
          <div className="text-2xl font-bold text-midnight">5</div>
      <div className="bg-gradient-to-r from-turquoise/10 to-turquoise/20 rounded-lg p-4">
      </div>
        <div className="bg-light-gray rounded-lg p-4">
          <span className="text-sm font-medium text-midnight/70">Volgende Level</span>
          <div className="h-2 bg-[#89CFF0]" style={{ width: `${pct}%` }} />
        <div className="w-full bg-midnight/10 rounded-full h-2 mb-2">
          <div className="bg-gradient-to-r from-turquoise to-primary h-2 rounded-full" style={{ width: '75%' }}></div>
          <div className="text-2xl font-bold text-midnight">1,250</div>
        <div className="text-xs text-midnight/60">250 XP tot Level 6</div>
      </div>
    </div>
  );
};

  )
}