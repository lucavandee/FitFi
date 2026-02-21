import React from "react";

export const GamificationPanel: React.FC<{ level?: number; xp?: number; streak?: number; loading?: boolean }> = ({ level, xp, streak = 0, loading = false }) => {
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

  const nextLv = Math.max(100, Math.ceil((level+1)*100)); // simple curve
  const pct = Math.min(100, Math.round((xp % nextLv) / nextLv * 100));
  return (
    <div className="bg-white rounded-2xl p-4 shadow flex items-center justify-between">
      <div>
        <div className="text-sm text-gray-500">Jouw level</div>
        <div className="text-2xl font-bold">Lv {level}</div>
        <div className="text-xs text-gray-500 mt-1">{xp} XP • {pct}% naar Lv {level+1}</div>
      </div>
      <div className="flex flex-col items-end">
        <div className="w-36 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-2 bg-[var(--ff-color-primary-500)]" style={{ width: `${pct}%` }} />
        </div>
        <div className="text-xs text-gray-500 mt-2">🔥 Streak: {streak} dagen</div>
      </div>
    </div>
  );
};