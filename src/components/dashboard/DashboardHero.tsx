import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import Button from '../ui/Button';

interface DashboardHeroProps {
  onExploreOutfits: () => void;
  className?: string;
}

const DashboardHero: React.FC<DashboardHeroProps> = ({ 
  onExploreOutfits, 
  className = '' 
}) => {
  const { user } = useUser();
  
  const getPersonalizedGoal = () => {
    const goals = [
      'jouw signature look',
      'de perfecte werkoutfit',
      'een statement piece',
      'jouw weekend stijl',
      'een tijdloze combinatie'
    ];
    
    // Simple hash based on user ID for consistency
    const userHash = user?.id ? user.id.charCodeAt(0) : 0;
    return goals[userHash % goals.length];
  };

  return (
    <div className={`relative bg-gradient-to-br from-white via-[#F6F6F6] to-[#89CFF0]/10 rounded-3xl shadow-sm overflow-hidden p-8 animate-fade-in ${className}`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-4 right-4 w-32 h-32 bg-[#89CFF0] rounded-full blur-3xl"></div>
        <div className="absolute bottom-4 left-4 w-24 h-24 bg-[#0D1B2A] rounded-full blur-2xl"></div>
      </div>
      
      <div className="relative flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-4 mb-4">
            {/* Nova Avatar */}
            <div className="w-16 h-16 bg-gradient-to-br from-[#89CFF0] to-blue-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            
            <div>
              <h1 className="text-3xl font-light text-[#0D1B2A] mb-1 animate-slide-up">
                Welkom terug, <span className="font-medium">{user?.name || 'Stylist'}!</span>
              </h1>
              <p className="text-lg text-gray-600 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                Klaar om vandaag <span className="text-[#89CFF0] font-medium">{getPersonalizedGoal()}</span> te ontdekken?
              </p>
            </div>
          </div>
          
          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Button
              onClick={onExploreOutfits}
              variant="primary"
              size="lg"
              icon={<ArrowRight size={20} />}
              iconPosition="right"
              className="bg-[#89CFF0] hover:bg-[#89CFF0]/90 text-[#0D1B2A] shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              Start je stijldag
            </Button>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="hidden lg:block">
          <div className="relative">
            <div className="w-32 h-32 bg-gradient-to-br from-[#89CFF0]/20 to-blue-100 rounded-full flex items-center justify-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
                <span className="text-2xl">✨</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHero;