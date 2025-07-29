import React from 'react';
import { Trophy, Target, Zap, Sparkles, Star } from 'lucide-react';

interface ProgressMotivationProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

const ProgressMotivation: React.FC<ProgressMotivationProps> = ({ 
  currentStep, 
  totalSteps, 
  className = '' 
}) => {
  const progressPercentage = (currentStep / totalSteps) * 100;
  
  const getMotivationMessage = () => {
    if (currentStep === 1) {
      return {
        icon: Target ? <Target className="w-5 h-5" /> : <Star className="w-5 h-5" />,
        message: "Geweldige start! Laten we je stijl ontdekken.",
        color: "text-blue-600"
      };
    } else if (currentStep === 2) {
      return {
        icon: Zap ? <Zap className="w-5 h-5" /> : <Star className="w-5 h-5" />,
        message: "Je stijlprofiel begint vorm te krijgen!",
        color: "text-purple-600"
      };
    } else if (currentStep === 3) {
      return {
        icon: Sparkles ? <Sparkles className="w-5 h-5" /> : <Star className="w-5 h-5" />,
        message: "Halfway! Je doet het geweldig.",
        color: "text-green-600"
      };
    } else if (currentStep === 4) {
      return {
        icon: Trophy ? <Trophy className="w-5 h-5" /> : <Star className="w-5 h-5" />,
        message: "Bijna klaar! Nog één vraag te gaan.",
        color: "text-orange-600"
      };
    } else {
      return {
        icon: Trophy ? <Trophy className="w-5 h-5" /> : <Star className="w-5 h-5" />,
        message: "Perfect! Klaar voor je stijlresultaten.",
        color: "text-[#bfae9f]"
      };
    }
  };
  
  const motivation = getMotivationMessage();
  
  // Guard tegen undefined icon
  if (!motivation.icon) return null;
  
  return (
    <div className={`text-center ${className}`}>
      <div className="flex items-center justify-center space-x-2 mb-2">
        <div className={motivation.color}>
          <span aria-hidden="true">{motivation.icon}</span>
        </div>
        <span className={`text-sm font-medium ${motivation.color}`}>
          {motivation.message}
        </span>
      </div>
      
      <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
        <span>Vraag {currentStep} van {totalSteps}</span>
        <span>•</span>
        <span>{Math.round(progressPercentage)}% voltooid</span>
      </div>
    </div>
  );
};

export default ProgressMotivation;