import React from 'react';
import { Star, Users, Target } from 'lucide-react';

interface KPIBadgesProps {
  className?: string;
}

const KPIBadges: React.FC<KPIBadgesProps> = ({ className = '' }) => {
  const kpis = [
    {
      icon: <Users size={14} />,
      value: '10.000+',
      label: 'rapporten'
    },
    {
      icon: <Star size={14} />,
      value: '4.8/5',
      label: 'rating'
    },
    {
      icon: <Target size={14} />,
      value: '95%',
      label: 'accuratesse'
    }
  ];

  return (
    <div className={`flex flex-wrap justify-center items-center gap-4 ${className}`}>
      {kpis.map((kpi, index) => (
        <div 
          key={index}
          className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-3 py-2 shadow-sm border border-gray-100"
        >
          <div className="text-[#bfae9f]">
            {kpi.icon}
          </div>
          <div className="text-sm">
            <span className="font-semibold text-gray-900">{kpi.value}</span>
            <span className="text-gray-600 ml-1">{kpi.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default KPIBadges;