import React from 'react';
import { ArrowRight, TrendingUp, Star } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import Button from '../ui/Button';
import ImageWithFallback from '../ui/ImageWithFallback';

interface WelcomeSectionProps {
  className?: string;
}

const WelcomeSection: React.FC<WelcomeSectionProps> = ({ className = '' }) => {
  const { user } = useUser();
  
  // Mock data for insights - in real app this would come from analytics
  const insights = [
    "Sinds vorige week heb je 3 nieuwe favoriete stijlen ontdekt!",
    "Jouw stijlmatch-score is gestegen naar 87% – goed bezig!"
  ];

  const firstName = user?.name?.split(' ')[0] || 'Stijlzoeker';

  return (
    <section className={`bg-white rounded-3xl shadow-sm overflow-hidden ${className}`} aria-labelledby="welcome-heading">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
        {/* Content */}
        <div className="p-8 lg:p-12 flex flex-col justify-center">
          <h1 id="welcome-heading" className="text-3xl lg:text-4xl font-light text-gray-900 leading-tight mb-6">
            Welkom terug, <span className="font-medium">{firstName}</span>!<br />
            <span className="text-2xl lg:text-3xl text-gray-600">
              Nova staat klaar voor jouw volgende stijl-upgrade.
            </span>
          </h1>
          
          {/* Dynamic Insights */}
          <div className="space-y-4 mb-8">
            {insights.map((insight, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-[#bfae9f]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  {index === 0 ? (
                    <Star className="w-3 h-3 text-[#bfae9f]" />
                  ) : (
                    <TrendingUp className="w-3 h-3 text-[#bfae9f]" />
                  )}
                </div>
                <p className="text-gray-700 leading-relaxed">{insight}</p>
              </div>
            ))}
          </div>
          
          {/* CTA Button */}
          <Button
            variant="primary"
            size="lg"
            icon={<ArrowRight size={20} />}
            iconPosition="right"
            className="bg-[#bfae9f] hover:bg-[#a89a8c] text-white self-start"
            aria-label="Bekijk nieuwe outfit aanbevelingen"
          >
            Nieuwe outfit bekijken
          </Button>
        </div>
        
        {/* Premium Visual */}
        <div className="relative h-64 lg:h-full min-h-[400px]">
          <ImageWithFallback
            src="https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&dpr=2"
            alt="Laatste aanbevolen outfit - elegante casual look"
            className="w-full h-full object-cover"
            componentName="WelcomeSection"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          
          {/* Floating badge */}
          <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
            <span className="text-sm font-medium text-gray-900">Nieuw voor jou</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WelcomeSection;