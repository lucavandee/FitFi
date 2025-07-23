import React from 'react';
import { TrendingUp, Award, Target } from 'lucide-react';

interface Badge {
  id: string;
  name: string;
  icon: string;
  earned: boolean;
  description: string;
}

interface StyleStatisticsLandingProps {
  className?: string;
}

const StyleStatisticsLanding: React.FC<StyleStatisticsLandingProps> = ({ className = '' }) => {
  // Mock data - in real app this would come from user analytics
  const styleMatchData = [
    { month: 'Jan', score: 65 },
    { month: 'Feb', score: 72 },
    { month: 'Mrt', score: 78 },
    { month: 'Apr', score: 81 },
    { month: 'Mei', score: 87 }
  ];

  const badges: Badge[] = [
    {
      id: 'discoverer',
      name: 'Stijl Ontdekker',
      icon: '🔍',
      earned: true,
      description: 'Eerste 10 outfits bekeken'
    },
    {
      id: 'trendsetter',
      name: 'Trendsetter',
      icon: '✨',
      earned: true,
      description: '5 trends toegepast'
    },
    {
      id: 'curator',
      name: 'Style Curator',
      icon: '🎨',
      earned: false,
      description: '25 outfits opgeslagen'
    },
    {
      id: 'influencer',
      name: 'Style Influencer',
      icon: '👑',
      earned: false,
      description: '10 looks gedeeld'
    }
  ];

  const currentLevel = 'Trendsetter';
  const nextLevel = 'Style Curator';
  const progress = 75; // Percentage to next level

  return (
    <section className={`bg-white rounded-3xl p-8 shadow-sm ${className}`} aria-labelledby="statistics-heading">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-blue-500" />
        </div>
        <div>
          <h2 id="statistics-heading" className="text-2xl font-light text-gray-900">
            Mijn Stijl-Statistieken
          </h2>
          <p className="text-gray-600">Jouw stijlreis in cijfers</p>
        </div>
      </div>

      {/* Style Match Chart */}
      <div className="mb-8">
        <h3 className="font-medium text-gray-900 mb-4">Stijlmatch over tijd</h3>
        <div className="relative h-32 bg-gray-50 rounded-xl p-4">
          <svg className="w-full h-full" viewBox="0 0 400 80" preserveAspectRatio="none">
            {/* Grid lines */}
            <defs>
              <pattern id="grid" width="80" height="20" patternUnits="userSpaceOnUse">
                <path d="M 80 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            {/* Chart line */}
            <polyline
              fill="none"
              stroke="#bfae9f"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={styleMatchData.map((point, index) => 
                `${(index / (styleMatchData.length - 1)) * 400},${80 - (point.score / 100) * 80}`
              ).join(' ')}
            />
            
            {/* Data points */}
            {styleMatchData.map((point, index) => (
              <circle
                key={index}
                cx={(index / (styleMatchData.length - 1)) * 400}
                cy={80 - (point.score / 100) * 80}
                r="4"
                fill="#bfae9f"
                className="hover:r-6 transition-all cursor-pointer"
              >
                <title>{point.month}: {point.score}%</title>
              </circle>
            ))}
          </svg>
          
          {/* Current score */}
          <div className="absolute top-2 right-2 bg-white rounded-lg px-3 py-1 shadow-sm">
            <span className="text-sm font-medium text-[#bfae9f]">87%</span>
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="mb-8">
        <h3 className="font-medium text-gray-900 mb-4">Behaalde Badges</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {badges.map((badge) => (
            <div 
              key={badge.id} 
              className={`text-center p-4 rounded-xl border-2 transition-all ${
                badge.earned 
                  ? 'border-[#bfae9f] bg-[#bfae9f]/5' 
                  : 'border-gray-200 bg-gray-50 opacity-60'
              }`}
            >
              <div className="text-2xl mb-2">{badge.icon}</div>
              <h4 className="font-medium text-gray-900 text-sm mb-1">{badge.name}</h4>
              <p className="text-xs text-gray-600">{badge.description}</p>
              {badge.earned && (
                <div className="mt-2">
                  <Award className="w-4 h-4 text-[#bfae9f] mx-auto" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Progress to Next Level */}
      <div className="bg-gradient-to-r from-[#bfae9f]/10 to-[#bfae9f]/5 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Target className="w-5 h-5 text-[#bfae9f]" />
            <div>
              <h3 className="font-medium text-gray-900">Huidige Level: {currentLevel}</h3>
              <p className="text-sm text-gray-600">Volgende: {nextLevel}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-medium text-[#bfae9f]">{progress}%</div>
            <div className="text-xs text-gray-500">Voortgang</div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-white rounded-full h-2 mb-3">
          <div 
            className="bg-[#bfae9f] h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <p className="text-sm text-gray-700">
          Nog <span className="font-medium">2 aanbevelingen toepassen</span> voor het volgende niveau!
        </p>
      </div>
    </section>
  );
};

export default StyleStatisticsLanding;