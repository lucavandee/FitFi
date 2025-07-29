import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, Users, Zap, Heart, Shield, CheckCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import ImageWithFallback from '../components/ui/ImageWithFallback';
import { ErrorBoundary } from '../components/ErrorBoundary';

const WhyFitFiPage: React.FC = () => {
  const uspCards = [
    {
      id: 'ai-styling',
      title: 'AI-Powered Styling',
      description: 'Onze geavanceerde AI analyseert jouw unieke stijl en persoonlijkheid voor perfect passende aanbevelingen.',
      icon: <Users className="w-8 h-8" />,
      color: 'bg-blue-50 text-blue-600'
    },
    {
      id: 'independent',
      title: 'Onafhankelijk Advies',
      description: 'Wij verdienen alleen als jij tevreden bent. Geen verborgen commissies of gesponsorde aanbevelingen.',
      icon: <Shield className="w-8 h-8" />,
      color: 'bg-green-50 text-green-600'
    },
    {
      id: 'sustainable',
      title: 'Duurzaam & Bewust',
      description: 'Focus op kwaliteit boven kwantiteit. Bouw een tijdloze garderobe die jaren meegaat.',
      icon: <Heart className="w-8 h-8" />,
      color: 'bg-purple-50 text-purple-600'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F6F6F6]">
      <Helmet>
        <title>Waarom FitFi? - AI-Powered Personal Styling | FitFi</title>
        <meta name="description" content="Ontdek waarom duizenden mensen kiezen voor FitFi's AI-powered styling advies. Onafhankelijk, duurzaam en met 14-dagen geld-terug garantie." />
        <meta property="og:title" content="Waarom FitFi? - AI-Powered Personal Styling" />
        <meta property="og:description" content="Ontdek waarom duizenden mensen kiezen voor FitFi's AI-powered styling advies." />
        <meta property="og:image" content="https://fitfi.ai/og-why-fitfi.jpg" />
        <link rel="canonical" href="https://fitfi.ai/waarom-fitfi" />
      </Helmet>

      <div className="max-w-7xl mx-auto py-12 px-4 md:px-8 lg:px-16">
        
        {/* Hero Section */}
        <ErrorBoundary>
          <section className="relative py-20 md:py-28 overflow-hidden bg-gradient-to-br from-[#F6F6F6] via-white to-[#F5F3F0] rounded-3xl mb-16 shadow-sm">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
              <div className="flex flex-col lg:flex-row items-center">
                <div className="flex-1 text-center lg:text-left mb-12 lg:mb-0 lg:pr-10">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-[#0D1B2A] leading-tight mb-6">
                    Waarom kiezen duizenden mensen voor{' '}
                    <span className="font-medium text-[#89CFF0]">FitFi?</span>
                  </h1>
                  
                  <p className="text-xl md:text-2xl text-gray-600 leading-relaxed max-w-2xl">
                    Wij revolutioneren personal styling met AI-technologie, onafhankelijk advies en een focus op duurzaamheid.
                  </p>
                  
                  <Button 
                    as={Link}
                    to="/registreren" 
                    variant="primary"
                    size="lg"
                    icon={<ArrowRight size={20} />}
                    iconPosition="right"
                    className="bg-[#89CFF0] hover:bg-[#89CFF0]/90 text-[#0D1B2A] px-8 py-4 text-lg font-medium shadow-lg hover:shadow-xl transition-all transform hover:scale-105 rounded-2xl mt-8"
                    aria-label="Start je gratis AI Style Report"
                  >
                    Probeer FitFi gratis
                  </Button>
                </div>
                
                <div className="flex-1 flex justify-center lg:justify-end relative">
                  <div className="relative h-[500px] w-[350px] rounded-3xl overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#89CFF0]/20 z-10"></div>
                    
                    <ImageWithFallback 
                      src="https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&dpr=2" 
                      alt="Vrouw die haar perfecte outfit heeft gevonden met FitFi" 
                      className="h-full w-full object-cover"
                      componentName="WhyFitFiPage"
                    />
                    
                    {/* Trust indicator overlay */}
                    <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-20">
                      <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-gray-700">10.000+ tevreden gebruikers</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </ErrorBoundary>

        {/* USP Cards */}
        <ErrorBoundary>
          <section className="py-20 bg-white rounded-3xl shadow-sm mb-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-light text-[#0D1B2A] mb-6">
                  Wat maakt FitFi anders?
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Wij combineren cutting-edge AI-technologie met mode-expertise voor een unieke, persoonlijke ervaring
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {uspCards.map((card) => (
                  <div 
                    key={card.id}
                    className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all hover:transform hover:scale-105 text-center group"
                  >
                    {/* Icon */}
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 ${card.color} group-hover:scale-110 transition-transform`}>
                      {card.icon}
                    </div>
                    
                    {/* Content */}
                    <h3 className="text-xl font-medium text-[#0D1B2A] mb-4">
                      {card.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                ))}
              </div>
              
              {/* Value Proposition */}
              <div className="mt-16 text-center">
                <div className="bg-gradient-to-r from-[#89CFF0]/10 to-purple-50 rounded-2xl p-8 max-w-4xl mx-auto">
                  <h3 className="text-2xl font-medium text-[#0D1B2A] mb-4">
                    Meer dan alleen mode-advies
                  </h3>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    FitFi's AI Style Report geeft je niet alleen outfit-aanbevelingen, maar helpt je begrijpen 
                    hoe jouw stijlkeuzes jouw persoonlijkheid weerspiegelen en hoe je dit kunt gebruiken 
                    om jouw doelen te bereiken.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </ErrorBoundary>

        {/* CTA Section */}
        <ErrorBoundary>
          <section className="bg-gradient-to-r from-[#89CFF0] to-blue-500 rounded-3xl shadow-sm overflow-hidden">
            <div className="p-8 md:p-12 text-center">
              <h2 className="text-3xl font-light text-white mb-6">
                Klaar om je stijl te transformeren?
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
                Sluit je aan bij duizenden tevreden gebruikers en ontdek wat FitFi voor jou kan betekenen.
              </p>
              <Button 
                as={Link}
                to="/registreren" 
                variant="secondary"
                size="lg"
                icon={<ArrowRight size={20} />}
                iconPosition="right"
                className="bg-white text-[#89CFF0] hover:bg-gray-50 text-lg px-8 py-4 font-medium shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 rounded-2xl"
              >
                Start nu gratis
              </Button>
              <p className="text-white/80 text-sm mt-4">
                14 dagen gratis proberen • Geen verplichtingen
              </p>
            </div>
          </section>
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default WhyFitFiPage;