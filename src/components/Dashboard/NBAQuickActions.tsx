import React from "react";
import { computeNextActions } from "@/services/nba/nextBestActions";
import { useUser } from "@/context/UserContext";
import { useBestChallenge } from "@/hooks/useBestChallenge";

export const NBAQuickActions: React.FC<{ ctx: Parameters<typeof computeNextActions>[0] }> = ({ ctx }) => {
  const { user } = useUser();
  const { best } = useBestChallenge(user?.id);

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
      {items.map(a => {
        // State-aware route mapping: gebruik de route uit computeNextActions,
        // alleen de "challenge" actie kan uitgeschakeld worden zonder open challenge.
        const route = a.route;
        const disabled = a.id === "challenge" ? !best?.challengeId : false;

        return (
          <a
            key={a.id}
            href={disabled ? undefined : route}
            onClick={() => handleActionClick(a)}
            className={`block rounded-2xl border border-purple-300/60 transition-all p-4 bg-white ${
              disabled 
                ? "opacity-50 cursor-not-allowed pointer-events-none" 
                : "hover:shadow-md hover:transform hover:scale-105"
            }`}
            title={disabled ? "Geen open challenge gevonden" : undefined}
            aria-disabled={disabled}
          >
            <div className="text-sm text-gray-500 mb-1">{a.badge ?? ""}</div>
            <div className="font-semibold">{a.title}</div>
            {a.subtitle && <div className="text-sm text-gray-600 mt-1">{a.subtitle}</div>}
            <div className={`mt-3 font-medium ${disabled ? "text-gray-400" : "text-[#9A503B]"}`}>
              {a.cta} →
            </div>
          </a>
        );
      })}
    </div>
  );
};