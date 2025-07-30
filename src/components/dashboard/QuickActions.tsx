import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, RefreshCw, User, BookOpen, Settings } from 'lucide-react';
import Button from '../ui/Button';

interface QuickActionsProps {
  onRestartQuiz: () => void;
  isResetting: boolean;
  className?: string;
}

const QuickActions: React.FC<QuickActionsProps> = ({ 
  onRestartQuiz, 
  isResetting, 
  className = '' 
}) => {
  const actions = [
    {
      id: 'results',
      title: 'Bekijk Resultaten',
      description: 'Zie je gepersonaliseerde outfit aanbevelingen',
      icon: <TrendingUp className="w-6 h-6" />,
      href: '/results',
      variant: 'primary' as const,
      className: 'bg-gradient-to-r from-brandGradientFrom to-brandGradientTo text-white hover:shadow-lg'
    },
    {
      id: 'outfits',
      title: 'Ontdek Outfits',
      description: 'Browse door alle outfit aanbevelingen',
      icon: <BookOpen className="w-6 h-6" />,
      href: '/outfits',
      variant: 'outline' as const,
      className: 'border-2 border-brandPurple text-brandPurple hover:bg-brandPurple hover:text-white'
    }
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      <h2 className="text-xl font-bold text-gray-900 mb-4">Snelle acties</h2>
      
      {/* Primary Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {actions.map((action) => (
          <Button
            key={action.id}
            as={Link}
            to={action.href}
            variant={action.variant}
            className={`p-6 h-auto flex-col items-start text-left transition-all duration-300 hover:scale-[1.02] ${action.className}`}
          >
            <div className="flex items-center space-x-3 mb-2">
              {action.icon}
              <span className="font-semibold">{action.title}</span>
            </div>
            <p className="text-sm opacity-90">{action.description}</p>
          </Button>
        ))}
      </div>

      {/* Secondary Actions */}
      <div className="bg-white rounded-3xl shadow-card p-6">
        <h3 className="font-medium text-gray-900 mb-4">Account beheer</h3>
        
        <div className="space-y-3">
          <Button
            onClick={onRestartQuiz}
            variant="outline"
            className="w-full justify-start border-gray-200 text-gray-700 hover:bg-gray-50"
            icon={isResetting ? (
              <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <RefreshCw size={16} />
            )}
            iconPosition="left"
            disabled={isResetting}
          >
            {isResetting ? 'Quiz resetten...' : 'Quiz opnieuw doen'}
          </Button>
          
          <Button
            as={Link}
            to="/profile"
            variant="outline"
            className="w-full justify-start border-gray-200 text-gray-700 hover:bg-gray-50"
            icon={<User size={16} />}
            iconPosition="left"
          >
            Profiel bewerken
          </Button>
          
          <Button
            as={Link}
            to="/help"
            variant="outline"
            className="w-full justify-start border-gray-200 text-gray-700 hover:bg-gray-50"
            icon={<Settings size={16} />}
            iconPosition="left"
          >
            Help & ondersteuning
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;