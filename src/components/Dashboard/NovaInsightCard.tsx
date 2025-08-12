import React from "react";

export const NovaInsightCard: React.FC<{ text: string }> = ({ text }) => {
  return (
    <div className="bg-gradient-to-r from-[#0D1B2A] to-[#1f2f46] text-white rounded-2xl p-5 shadow">
      <div className="text-sm opacity-80 mb-1">Nova • Daily Insight</div>
      <div className="text-lg font-semibold">{text}</div>
    </div>
  );
};