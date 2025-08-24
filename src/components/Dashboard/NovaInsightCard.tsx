import React from "react";

export const NovaInsightCard: React.FC<{
  text?: string;
  loading?: boolean;
}> = ({ text, loading = false }) => {
  // Loading skeleton
  if (loading || !text) {
    return (
      <div className="bg-gradient-to-r from-[#0D1B2A] to-[#1f2f46] text-white rounded-2xl p-5 shadow animate-pulse">
        <div className="text-sm opacity-80 mb-1">Nova • Daily Insight</div>
        <div className="space-y-2">
          <div className="h-4 bg-white/20 rounded w-3/4"></div>
          <div className="h-4 bg-white/20 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-[#0D1B2A] to-[#1f2f46] text-white rounded-2xl p-5 shadow">
      <div className="text-sm opacity-80 mb-1">Nova • Daily Insight</div>
      <div className="text-lg font-semibold">{text}</div>
    </div>
  );
};
