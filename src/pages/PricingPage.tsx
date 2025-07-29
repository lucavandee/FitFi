import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Check, Star, ArrowRight, Sparkles, Crown, Zap } from 'lucide-react';
import Button from '../components/ui/Button';
import { ErrorBoundary } from '../components/ErrorBoundary';

const PricingPage: React.FC = () => {
  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 'Gratis',
      period: 'altijd',
      description: 'Perfect om te beginnen met je stijlreis',
      icon: <Sparkles size={24} />,
      features: [
        'Basis stijlquiz',
        '3 outfit aanbevelingen per maand',
        '1 foto upload per maand',
        'Basis stijlprofiel',
        'Community toegang',
        'Email ondersteuning'
      ],
      cta: 'Gratis starten',
      ctaLink: '/registreren',
      popular: false,
      highlight: false
    },
    {
      id: 'plus',
      name: 'Plus',
      price: '€29',
      period: 'per maand',
      description: 'Voor wie het beste uit hun stijl wil halen',
      icon: <Crown size={24} />,
      features: [
        'Alles van Free',
        'Onbeperkte outfit aanbevelingen',
        'Onbeperkte foto uploads',
        'Gedetailleerd stijladvies',
        'Seizoensgebonden updates',
        'Prioriteit ondersteuning',
        'Exclusieve content',
        'Geavanceerde filters',
        'Personal shopping service'
      ],
      cta: 'Start Plus',
      ctaLink: '/registreren?plan=plus',
      popular: true,
      highlight: true
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '€79',
      period: 'per jaar',
      originalPrice: '€348',
      description: 'Voor stylisten en fashion professionals',
      icon: <Zap size={24} />,
      features: [
        'Alles van Plus',
        'Client management tools',
        'Bulk outfit generatie',
        'White-label opties',
        'API toegang',
        'Dedicated account manager',
        'Custom integraties',
        'Analytics dashboard',
        'Onbeperkte team members'
      ],
      cta: 'Kies Pro',
      ctaLink: '/registreren?plan=pro',
      popular: false,
      highlight: false,
      savings: '77% besparing'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F6F6F6]">
      <Helmet>
        <title>Prijzen - Kies je FitFi abonnement | FitFi</title>
        <meta name="description" content="Kies het FitFi abonnement dat bij je past. Free gratis, Plus €29/maand, Pro €79/jaar. 14 dagen gratis proberen." />
        <meta property="og:title" content="Prijzen - Kies je FitFi abonnement" />
        <meta property="og:description" content="Free gratis, Plus €29/maand, Pro €79/jaar. 14 dagen gratis proberen." />
        <meta property="og:image" content="https://fitfi.ai/og-pricing.jpg" />
        <link rel="canonical" href="https://fitfi.ai/prijzen" />
      </Helmet>

      <div className="max-w-7xl mx-auto py-12 px-4 md:px-8 lg:px-16">
        
        {/* Hero Section */}
        <ErrorBoundary>
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-light text-[#0D1B2A] mb-6">
              Kies jouw stijlupgrade
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
              Start gratis en upgrade wanneer je klaar bent. Alle abonnementen komen met 14 dagen geld-terug garantie.
            </p>
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center space-x-8 text-sm text-gray-500 mb-8">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>10.000+ tevreden gebruikers</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>4.8/5 gemiddelde beoordeling</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>14 dagen geld terug</span>
              </div>
            </div>
          </div>
        </ErrorBoundary>

        {/* Pricing Cards */}
        <ErrorBoundary>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {plans.map((plan) => (
              <div 
                key={plan.id} 
                className={`bg-white rounded-3xl shadow-sm overflow-hidden relative transition-all hover:shadow-lg ${
                  plan.highlight ? 'ring-2 ring-[#89CFF0]/20 shadow-lg scale-105' : ''
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
                
                {plan.savings && (
                  <div className="absolute top-4 right-4">
                    <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                      {plan.savings}
                    </div>
                  </div>
                )}
                
                <div className="p-8">
                  <div className="text-center mb-8">
                    <div className={`w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center ${
                      plan.highlight ? 'bg-[#89CFF0] text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {plan.icon}
                    </div>
                    
                    <h3 className="text-2xl font-medium text-[#0D1B2A] mb-2">
                      {plan.name}
                    </h3>
                    
                    <div className="mb-4">
                      <span className="text-4xl font-light text-[#0D1B2A]">{plan.price}</span>
                      <span className="text-gray-600 ml-2">{plan.period}</span>
                      {plan.originalPrice && (
                        <div className="text-sm text-gray-500 line-through mt-1">
                          Was {plan.originalPrice}
                        </div>
                      )}
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
                    variant={plan.highlight ? "primary" : "outline"}
                    size="lg"
                    fullWidth
                    className={plan.highlight 
                      ? "bg-[#89CFF0] hover:bg-[#89CFF0]/90 text-[#0D1B2A]" 
                      : "border-[#89CFF0] text-[#89CFF0] hover:bg-[#89CFF0] hover:text-[#0D1B2A]"
                    }
                  >
                    {plan.cta}
                  </Button>
                  
                  {plan.id === 'plus' && (
                    <p className="text-center text-sm text-gray-500 mt-3">
                      14 dagen gratis proberen
                    </p>
                  )}
                </div>
              </div>
            ))}
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