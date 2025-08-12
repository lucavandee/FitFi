import React from 'react';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { computeNextActions } from '@/services/nba/nextBestActions';
import { routeTo } from '@/services/navigation/NavigationService';
import { track } from '@/utils/analytics';
import Button from '../ui/Button';

interface NextBestActionsProps {
  ctx: Parameters<typeof computeNextActions>[0];
  className?: string;
}

const NextBestActions: React.FC<NextBestActionsProps> = ({ ctx, className = '' }) => {
  const actions = computeNextActions(ctx);

  const handleActionClick = (action: any) => {
    track('nba_action_click', {
      action_id: action.id,
      action_title: action.title,
      action_score: action.score,
      source: 'dashboard_nba'
    });

    if (typeof window.gtag === 'function') {
      window.gtag('event', 'nba_action_click', {
        event_category: 'dashboard',
        event_label: action.id,
        action_title: action.title,
        action_score: action.score
      });
    }
  };

  const getActionIcon = (iconName: string) => {
    // Map icon names to actual icons
    const iconMap: Record<string, React.ReactNode> = {
      'Scan': '🔍',
      'Users': '👥',
      'Trophy': '🏆',
      'Camera': '📸',
      'Share2': '📤',
      'Flame': '🔥'
    };
    
    return iconMap[iconName] || '✨';
  };

  const isActionCompleted = (actionId: string) => {
    switch (actionId) {
      case 'quiz':
        return ctx.hasQuiz;
      case 'tribe-join':
        return ctx.hasTribe;
      case 'post':
        return ctx.hasPost;
      case 'challenge':
        return ctx.hasSubmission;
      case 'invite':
        return ctx.referrals >= 3;
      case 'streak':
        return ctx.streak >= 7;
      default:
        return false;
    }
  };

  return (
    <div className={`bg-white rounded-3xl shadow-sm p-6 ${className}`}>
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
          <ArrowRight className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-[#0D1B2A]">Next Best Actions</h3>
          <p className="text-gray-600 text-sm">Aanbevolen voor jou</p>
        </div>
      </div>

      <div className="space-y-3">
        {actions.slice(0, 3).map((action, index) => {
          const completed = isActionCompleted(action.id);
          
          return (
            <div
              key={action.id}
              className={`group relative p-4 rounded-2xl border transition-all duration-300 hover:shadow-md animate-fade-in ${
                completed 
                  ? 'bg-green-50 border-green-200 opacity-75' 
                  : 'bg-gray-50 border-gray-200 hover:border-[#89CFF0] hover:bg-[#89CFF0]/5 cursor-pointer hover:transform hover:scale-105'
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => !completed && handleActionClick(action)}
            >
              {/* Completion Badge */}
              {completed && (
                <div className="absolute top-2 right-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              )}

              <div className="flex items-start space-x-4">
                {/* Icon */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${
                  completed 
                    ? 'bg-green-100' 
                    : 'bg-white shadow-sm group-hover:shadow-md transition-shadow'
                }`}>
                  {getActionIcon(action.icon || 'ArrowRight')}
                </div>
                
                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className={`font-medium ${
                      completed ? 'text-green-800' : 'text-[#0D1B2A]'
                    }`}>
                      {action.title}
                    </h4>
                    
                    {action.badge && !completed && (
                      <span className="px-2 py-1 bg-[#89CFF0]/10 text-[#89CFF0] rounded-full text-xs font-medium">
                        {action.badge}
                      </span>
                    )}
                  </div>
                  
                  <p className={`text-sm mb-3 ${
                    completed ? 'text-green-700' : 'text-gray-600'
                  }`}>
                    {action.subtitle || 'Voltooi deze actie voor extra punten'}
                  </p>
                  
                  {!completed && (
                    <div className="text-xs font-medium text-[#89CFF0] group-hover:text-[#89CFF0]/80 transition-colors">
                      {action.cta} →
                    </div>
                  )}
                  
                  {completed && (
                    <div className="text-xs font-medium text-green-600">
                      ✓ Voltooid
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-[#89CFF0]">{ctx.level}</div>
            <div className="text-xs text-gray-600">Level</div>
          </div>
          <div>
            <div className="text-lg font-bold text-orange-500">{ctx.streak}</div>
            <div className="text-xs text-gray-600">Streak</div>
          </div>
          <div>
            <div className="text-lg font-bold text-purple-600">{ctx.referrals}/3</div>
            <div className="text-xs text-gray-600">Referrals</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamificationPanel;