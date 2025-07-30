import React, { useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, MessageSquare, Brain, FileText } from 'lucide-react';

interface FlowStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

interface HorizontalFlowProps {
  className?: string;
}

const HorizontalFlow: React.FC<HorizontalFlowProps> = ({ className = '' }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const steps: FlowStep[] = [
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

  const scrollToStep = (stepIndex: number) => {
    if (scrollRef.current) {
      const stepWidth = scrollRef.current.offsetWidth * 0.8; // 80vw per step
      scrollRef.current.scrollTo({
        left: stepIndex * stepWidth,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className={`py-12 md:py-20 ${className}`} data-section="flow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-light text-gray-900 mb-4 md:mb-6">
            Hoe werkt het?
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            In drie eenvoudige stappen naar jouw persoonlijke AI Style Report
          </p>
        </div>
        
        {/* Mobile Horizontal Swiper */}
        <div className="md:hidden">
          <div 
            ref={scrollRef}
            className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {steps.map((step, index) => (
              <div 
                key={step.id} 
                className="flex-none w-[80vw] px-4 snap-center"
              >
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center h-full">
                  {/* Step Number */}
                  <div className="w-8 h-8 bg-[#bfae9f] text-white rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-4">
                    {step.id}
                  </div>
                  
                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 ${step.color}`}>
                    {step.icon}
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Dots Indicator */}
          <div className="flex justify-center space-x-2 mt-4">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollToStep(index)}
                className="w-2 h-2 rounded-full bg-gray-300 transition-colors"
                aria-label={`Ga naar stap ${index + 1}`}
              />
            ))}
          </div>
        </div>
        
        {/* Desktop Grid (unchanged) */}
        <div className="hidden md:grid md:grid-cols-3 gap-8 lg:gap-12">
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
        <div className="text-center mt-8 md:mt-16">
          <div className="inline-flex items-center space-x-2 text-sm text-gray-500 bg-white rounded-full px-6 py-3 shadow-sm border border-gray-100">
            <div className="w-2 h-2 bg-[#bfae9f] rounded-full animate-pulse"></div>
            <span>Gemiddelde tijd: 2 minuten</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HorizontalFlow;