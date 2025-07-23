import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import Button from '../ui/Button';

interface StyleInsight {
  id: string;
  title: string;
  description: string;
  actionText: string;
}

interface AIStyleReportLandingProps {
  className?: string;
}

const AIStyleReportLanding: React.FC<AIStyleReportLandingProps> = ({ className = '' }) => {
  const styleProfile = {
    title: "Minimalistisch Modern",
    description: "Jouw voorkeur voor minimalistische stijl straalt vertrouwen en professionaliteit uit.",
    matchScore: 87
  };

  const insights: StyleInsight[] = [
    {
      id: 'contrast',
      title: "Contrastkleuren",
      description: "Draag vaker contrastkleuren om autoriteit uit te stralen.",
      actionText: "Toepassen"
    },
    {
      id: 'layering',
      title: "Gelaagde Look",
      description: "Gebruik gelaagde kledingstukken voor een krachtige eerste indruk.",
      actionText: "Toepassen"
    },
    {
      id: 'fitted',
      title: "Fitted Items",
      description: "Focus op fitted items voor meer uitstraling.",
      actionText: "Toepassen"
    }
  ];

  return (
    <section className={`space-y-6 ${className}`} aria-labelledby="style-report-heading">
      {/* Main Style Report Card */}
      <div className="bg-white rounded-3xl p-8 shadow-sm">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-[#bfae9f]/20 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-[#bfae9f]" />
            </div>
            <div>
              <h2 id="style-report-heading" className="text-2xl font-light text-gray-900">
                Mijn AI Style Rapport
              </h2>
              <p className="text-gray-600">Gepersonaliseerd voor jou</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-3xl font-light text-[#bfae9f] mb-1">
              {styleProfile.matchScore}%
            </div>
            <p className="text-sm text-gray-500">Stijlmatch</p>
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            {styleProfile.title}
          </h3>
          <p className="text-gray-700 leading-relaxed mb-6">
            {styleProfile.description}
          </p>
          
          <Button
            variant="outline"
            icon={<ArrowRight size={16} />}
            iconPosition="right"
            className="border-[#bfae9f] text-[#bfae9f] hover:bg-[#bfae9f] hover:text-white"
          >
            Bekijk volledige profiel
          </Button>
        </div>
      </div>

      {/* Insight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {insights.map((insight) => (
          <div key={insight.id} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <h4 className="font-medium text-gray-900 mb-3">
              {insight.title}
            </h4>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              {insight.description}
            </p>
            <Button
              variant="ghost"
              size="sm"
              icon={<ArrowRight size={14} />}
              iconPosition="right"
              className="text-[#bfae9f] hover:bg-[#bfae9f]/10 p-0 h-auto font-medium"
            >
              {insight.actionText}
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AIStyleReportLanding;