import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, Users, Heart, Shield, CheckCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import ImageWithFallback from '../components/ui/ImageWithFallback';
import GradientWord from '../components/ui/GradientWord';
import { ErrorBoundary } from '../components/ErrorBoundary';

const AboutPage: React.FC = () => {
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
    },
    {
      id: 'guarantee',
      title: '14-Dagen Geld Terug',
      description: 'Niet tevreden? Krijg je geld terug, geen vragen gesteld. Wij staan achter onze service.',
      icon: <CheckCircle className="w-8 h-8" />,
      color: 'bg-orange-50 text-orange-600'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F6F6F6]">
      <Helmet>
        <title>Waarom FitFi? - AI-Powered Personal Styling | FitFi</title>
        <meta name="description" content="Ontdek waarom duizenden mensen kiezen voor FitFi's AI-powered styling advies. Onafhankelijk, duurzaam en met 14-dagen geld-terug garantie." />
        <meta property="og:title" content="Waarom FitFi? - AI-Powered Personal Styling" />
        <meta property="og:description" content="Ontdek waarom duizenden mensen kiezen voor FitFi's AI-powered styling advies." />
        <meta property="og:image" content="https://fitfi.app/og-about.jpg" />
        <link rel="canonical" href="https://fitfi.app/over-ons" />
      </Helmet>

      <div className="max-w-7xl mx-auto py-12 px-4 md:px-8 lg:px-16">
        
        {/* Hero Section */}
        <ErrorBoundary>
          <section className="not-prose relative py-20 md:py-28 overflow-hidden bg-gradient-to-br from-[#F6F6F6] via-white to-[#F5F3F0] rounded-3xl mb-16 shadow-sm">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
              <div className="flex flex-col lg:flex-row items-center">
                <div className="flex-1 text-center lg:text-left mb-12 lg:mb-0 lg:pr-10">
                  <h1 id="hero-heading" className="font-heading font-extrabold leading-[1.05] tracking-[-.02em] text-[clamp(2.6rem,5.4vw+.2rem,6rem)] text-[#0D1B2A] mb-6">
                    Waarom kiezen duizenden mensen voor <GradientWord variant="fitfi">FitFi</GradientWord>?
                  </h1>
                  
                  <p className="text-[#6B7280] text-lg md:text-xl mt-6 max-w-3xl mb-8 leading-relaxed">
                    Wij revolutioneren personal styling met AI-technologie, onafhankelijk advies en een focus op duurzaamheid.
                  </p>
                  
                  <Button 
                    as={Link}
                    to="/registreren" 
                    variant="primary"
                    size="lg"
                    icon={<ArrowRight size={20} />}
                    iconPosition="right"
                    className="bg-[#89CFF0] hover:bg-[#89CFF0]/90 text-[#0D1B2A] px-8 py-4 text-lg font-medium shadow-lg hover:shadow-xl transition-all transform hover:scale-105 rounded-2xl"
                  >
                <h1 id="hero-heading" className="hero-title mb-6">
                  </Button>
                </div>
                
                <div className="flex-1 flex justify-center lg:justify-end relative">
                  <div className="glass-card h-[500px] w-[350px]">
                    <div className="relative w-full h-full">
                      <ImageWithFallback 
                        src="https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&dpr=2" 
                        alt="Vrouw die haar perfecte outfit heeft gevonden met FitFi" 
                        className="img-fit"
                        componentName="AboutPage"
                      />
                    </div>
                    
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
                <p className="copy-muted text-lg md:text-xl mt-6 max-w-3xl mb-8 leading-relaxed">
                  Wij revolutioneren personal styling met AI-technologie, onafhankelijk advies en een focus op <span className="heading-reset accent-underline">duurzaamheid</span>.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {uspCards.map((card) => (
                  <div key={card.id} className="text-center group">
                    <div className={`w-16 h-16 ${card.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform`}>
                      {card.icon}
                    </div>
                    <h3 className="text-xl font-medium text-[#0D1B2A] mb-4">
                      {card.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </ErrorBoundary>

        {/* Mission Statement */}
        <ErrorBoundary>
          <section className="py-20 bg-gradient-to-r from-[#89CFF0]/10 to-blue-50 rounded-3xl shadow-sm mb-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl text-center">
              <h2 className="text-3xl md:text-4xl font-light text-[#0D1B2A] mb-8">
                Onze Missie
              </h2>
              <p className="text-xl text-gray-700 leading-relaxed max-w-4xl mx-auto mb-8">
                Wij geloven dat iedereen recht heeft op stijladvies dat echt bij hen past. Daarom hebben we FitFi ontwikkeld: 
                een AI-powered platform dat jouw unieke persoonlijkheid, lichaamsbouw en lifestyle analyseert om 
                gepersonaliseerde outfit aanbevelingen te doen die je zelfvertrouwen boosten.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6">
                  <h3 className="text-lg font-medium text-[#0D1B2A] mb-3">Toegankelijk</h3>
                  <p className="text-gray-600">Personal styling voor iedereen, niet alleen voor de elite.</p>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6">
                  <h3 className="text-lg font-medium text-[#0D1B2A] mb-3">Inclusief</h3>
                  <p className="text-gray-600">Voor alle lichaamstypes, budgets en stijlvoorkeuren.</p>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6">
                  <h3 className="text-lg font-medium text-[#0D1B2A] mb-3">Duurzaam</h3>
                  <p className="text-gray-600">Focus op tijdloze stukken die jaren meegaan.</p>
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
                variant="primary"
                size="lg"
                icon={<ArrowRight size={20} />}
                iconPosition="right"
                className="cta-btn px-8 py-4 text-lg font-medium shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                Start nu gratis
              </Button>
              <p className="text-sm text-white/80 mt-4">
                14 dagen gratis proberen • Geen verplichtingen
              </p>
            </div>
          </section>
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default AboutPage;