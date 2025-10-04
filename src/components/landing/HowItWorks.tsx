import React from 'react';
import { MessageSquare, Brain, FileText } from 'lucide-react';
import Container from '../layout/Container';
interface Step {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

interface HowItWorksProps {
  className?: string;
}

const HowItWorks: React.FC<HowItWorksProps> = ({ className = '' }) => {
  const steps: Step[] = [
    {
      id: 1,
      title: "Doe onze snelle AI-stijlquiz",
      description: "Beantwoord enkele vragen over jouw stijlvoorkeuren en persoonlijkheid. Duurt slechts 2 minuten.",
      icon: <MessageSquare size={32} />,
      color: "bg-blue-50 text-blue-600"
    },
    {
      id: 2,
      title: "Nova analyseert jouw antwoorden",
      description: "Onze AI analyseert jouw antwoorden psychologisch en stijltechnisch voor diepgaande inzichten.",
      icon: <Brain size={32} />,
      color: "bg-purple-50 text-purple-600"
    },
    {
      id: 3,
      title: "Ontvang jouw gepersonaliseerde rapport",
      description: "Direct jouw stijlrapport met inzichten, outfit-tips en persoonlijke aanbevelingen.",
      icon: <FileText size={32} />,
      color: "bg-green-50 text-green-600"
    }
  ];

  return (
    <section className={`py-20 bg-gray-50 ${className}`} aria-labelledby="how-it-works-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 id="how-it-works-heading" className="text-3xl md:text-4xl font-light text-gray-900 mb-6">
            Hoe werkt het?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            In drie eenvoudige stappen naar jouw persoonlijke AI Style Report
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <div key={step.id} className="relative">
              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-full w-full h-0.5 bg-gray-200 transform translate-x-6 z-0">
                  <div className="absolute right-0 top-1/2 transform translate-y-1/2 w-3 h-3 bg-gray-200 rounded-full"></div>
                </div>
              )}
              
              <div className="relative bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-center">
                {/* Step Number */}
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-[#bfae9f] text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {step.id}
                </div>
                
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 ${step.color}`}>
                  {step.icon}
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-medium text-gray-900 mb-4">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center space-x-2 text-sm text-gray-500 bg-white rounded-full px-6 py-3 shadow-sm border border-gray-100">
            <div className="w-2 h-2 bg-[#bfae9f] rounded-full animate-pulse"></div>
            <span>Gemiddelde tijd: 2 minuten</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;