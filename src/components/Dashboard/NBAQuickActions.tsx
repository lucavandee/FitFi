import React from "react";
import { computeNextActions } from "@/services/nba/nextBestActions";
import { Link } from "react-router-dom";

export const NBAQuickActions: React.FC<{ ctx: Parameters<typeof computeNextActions>[0] }> = ({ ctx }) => {
  const items = computeNextActions(ctx);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {items.map(a => (
        <Link key={a.id} to={a.route} className="rounded-2xl border border-purple-300/60 hover:shadow-md transition p-4 bg-white">
          <div className="text-sm text-gray-500 mb-1">{a.badge ?? ""}</div>
          <div className="font-semibold">{a.title}</div>
          {a.subtitle && <div className="text-sm text-gray-600 mt-1">{a.subtitle}</div>}
          <div className="mt-3 text-[#6b21a8] font-medium">{a.cta} →</div>
        </Link>
      ))}
    </div>
  );
};