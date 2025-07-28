import React from 'react';
import { Link } from 'react-router-dom';
import { Check, Star, ArrowRight, Sparkles } from 'lucide-react';
import Button from '../components/ui/Button';
import ErrorBoundary from '../components/ErrorBoundary';

const PricingPage: React.FC = () => {
  const plans = [
    {
      id: 'free',
      name: 'Gratis',
      price: '€0',
      period: 'altijd gratis',
      description: 'Perfect om te beginnen met je stijlreis',
      features: [
        'Basis stijlquiz',
        '3 outfit aanbevelingen',
        '1 foto upload per maand',
        'Basis stijlprofiel',
        'Community toegang'
      ],
      cta: 'Gratis starten',
      ctaLink: '/registreren',
      popular: false
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '€9,99',
      period: 'per maand',
      description: 'Voor wie het beste uit hun stijl wil halen',
      features: [
        'Alles van Gratis',
        'Onbeperkte outfit aanbevelingen',
        'Onbeperkte foto uploads',
        'Gedetailleerd stijladvies',
        'Seizoensgebonden updates',
        'Prioriteit ondersteuning',
        'Exclusieve content',
        'Geavanceerde filters'
      ],
      cta: 'Start premium proefperiode',
      ctaLink: '/registreren?plan=premium',
      popular: true
    },
    {
      id: 'business',
      name: 'Business',
      price: '€49,99',
      period: 'per maand',
      description: 'Voor stylisten en fashion professionals',
      features: [
        'Alles van Premium',
        'Client management tools',
        'Bulk outfit generatie',
        'White-label opties',
        'API toegang',
        'Dedicated account manager',
        'Custom integraties',
        'Analytics dashboard'
      ],
      cta: 'Contact opnemen',
      ctaLink: '/contact',
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-[#F6F6F6]">
      <div className="max-w-7xl mx-auto py-12 px-4 md:px-8 lg:px-16">
        
        {/* Hero Section */}
        <ErrorBoundary>
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-light text-[#0D1B2A] mb-6">
              Kies jouw stijlupgrade
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
              Start gratis — upgrade wanneer jij wilt, zonder verrassingen.
            </p>
          </div>
        </ErrorBoundary>

        {/* Pricing Cards */}
        <ErrorBoundary>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {plans.map((plan) => (
              <div 
                key={plan.id} 
                className={`bg-white rounded-3xl shadow-sm overflow-hidden relative ${
                  plan.popular ? 'ring-2 ring-[#89CFF0]/20 shadow-lg' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="bg-[#89CFF0] text-[#0D1B2A] px-4 py-1 rounded-full text-sm font-medium flex items-center">
                      <Star size={14} className="mr-1" />
                      Populairste keuze
                    </div>
                  </div>
                )}
                
                <div className="p-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-medium text-[#0D1B2A] mb-2">
                      {plan.name}
                    </h3>
                    <div className="mb-4">
                      <span className="text-4xl font-light text-[#0D1B2A]">{plan.price}</span>
                      <span className="text-gray-600 ml-2">{plan.period}</span>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      {plan.description}
                    </p>
                  </div>
                  
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <Check className="text-[#89CFF0] flex-shrink-0 mt-0.5" size={18} />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button
                    as={Link}
                    to={plan.ctaLink}
                    variant={plan.popular ? "primary" : "outline"}
                    size="lg"
                    fullWidth
                    className={plan.popular 
                      ? "bg-[#89CFF0] hover:bg-[#89CFF0]/90 text-[#0D1B2A]" 
                      : "border-[#89CFF0] text-[#89CFF0] hover:bg-[#89CFF0] hover:text-[#0D1B2A]"
                    }
                  >
                    {plan.cta}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ErrorBoundary>

        {/* FAQ Section */}
        <ErrorBoundary>
          <div className="bg-white rounded-3xl shadow-sm p-8 md:p-12 mb-16">
            <h2 className="text-3xl font-light text-[#0D1B2A] text-center mb-12">
              Veelgestelde vragen
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-medium text-[#0D1B2A] mb-3">
                  Kan ik altijd opzeggen?
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Ja, je kunt je abonnement op elk moment opzeggen. Er zijn geen verborgen kosten of lange contracten.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-[#0D1B2A] mb-3">
                  Hoe nauwkeurig zijn de aanbevelingen?
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Onze AI heeft een nauwkeurigheid van 95% en wordt continu verbeterd op basis van gebruikersfeedback.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-[#0D1B2A] mb-3">
                  Wat gebeurt er met mijn foto's?
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Je foto's worden veilig opgeslagen en alleen gebruikt voor stijlanalyse. Je kunt ze altijd verwijderen.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-[#0D1B2A] mb-3">
                  Is er een proefperiode?
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Ja, Premium heeft een gratis proefperiode van 14 dagen. Je kunt altijd binnen deze periode opzeggen.
                </p>
              </div>
            </div>
          </div>
        </ErrorBoundary>

        {/* CTA Section */}
        <ErrorBoundary>
          <div className="bg-gradient-to-r from-[#89CFF0] to-blue-500 rounded-3xl shadow-sm overflow-hidden">
            <div className="p-8 md:p-12 text-center">
              <h2 className="text-3xl font-light text-white mb-6">
                Klaar om je stijl te transformeren?
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
                Begin vandaag nog gratis en ontdek hoe FitFi jouw stijl en zelfvertrouwen kan verbeteren.
              </p>
              <Button 
                as={Link}
                to="/registreren" 
                variant="secondary"
                size="lg"
                icon={<ArrowRight size={20} />}
                iconPosition="right"
                className="bg-white text-[#89CFF0] hover:bg-gray-100 px-8 py-4 text-lg font-medium shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                Start nu gratis
              </Button>
              <p className="text-white/80 text-sm mt-4">
                Geen creditcard vereist • 14 dagen gratis proberen
              </p>
            </div>
          </div>
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default PricingPage;