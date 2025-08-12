import React from "react";
import { computeNextActions } from "@/services/nba/nextBestActions";
import { navigationService } from "@/services/navigation/NavigationService";
import { Link } from "react-router-dom";

export const NBAQuickActions: React.FC<{ ctx: Parameters<typeof computeNextActions>[0] }> = ({ ctx }) => {
  const items = computeNextActions(ctx);
  
  const handleActionClick = (action: any) => {
    // Track NBA action click
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'nba_action_click', {
        event_category: 'dashboard',
        event_label: action.id,
        action_title: action.title,
        action_score: action.score
      });
    }
  };
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {items.map(a => (
        <Link 
          key={a.id} 
          to={a.route} 
          onClick={() => handleActionClick(a)}
          className="rounded-2xl border border-purple-300/60 hover:shadow-md transition p-4 bg-white hover:transform hover:scale-105"
        >
          <div className="text-sm text-gray-500 mb-1">{a.badge ?? ""}</div>
          <div className="font-semibold">{a.title}</div>
          {a.subtitle && <div className="text-sm text-gray-600 mt-1">{a.subtitle}</div>}
          <div className="mt-3 text-[#6b21a8] font-medium">{a.cta} →</div>
        </Link>
      ))}
    </div>
  );
};