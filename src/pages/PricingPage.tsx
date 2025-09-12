import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Seo from '@/components/Seo';
import { Check, Star, ArrowRight, Sparkles, Crown, Zap } from 'lucide-react';
import Button from '../components/ui/Button';
import { ErrorBoundary } from '../components/ErrorBoundary';

const PricingPage: React.FC = () => {
  const plans = [
    {
      id: 'basic',
      name: 'Basic',
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
      id: 'premium',
      name: 'Premium',
      price: '€29',
      period: 'per maand',
      description: 'Voor wie het beste uit hun stijl wil halen',
      icon: <Crown size={24} />,
      features: [
        'Alles van Basic',
        'Onbeperkte outfit aanbevelingen',
        'Onbeperkte foto uploads',
        'Gedetailleerd stijladvies',
        'Seizoensgebonden updates',
        'Prioriteit ondersteuning',
        'Exclusieve content',
        'Geavanceerde filters',
        'Personal shopping service'
      ],
      cta: 'Start premium',
      ctaLink: '/registreren?plan=premium',
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
        'Alles van Premium',
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
      <Seo 
        title="Prijzen - Kies je FitFi abonnement"
        description="Kies het FitFi abonnement dat bij je past. Basic gratis, Premium €29/maand, Pro €79/jaar. 14 dagen gratis proberen."
        canonical="https://fitfi.app/prijzen"
        image="https://fitfi.app/og-pricing.jpg"
        keywords="FitFi prijzen, abonnement kosten, premium styling, gratis stijladvies, fashion subscription"
      />

      <section className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        
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
            <div className="flex flex-wrap justify-center gap-6 mt-6 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span>10.000+ tevreden gebruikers</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <span>4.8/5 gemiddelde beoordeling</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                <span>14 dagen geld terug</span>
              </div>
            </div>
          </div>
        </ErrorBoundary>

        {/* Pricing Cards */}
        <ErrorBoundary>
          <div className="pricing-scroll flex gap-6 sm:hidden mb-16" data-kind="pricing">
            {plans.map((plan) => (
              <div 
                key={plan.id} 
                className={`flex flex-col rounded-3xl shadow-lg/10 ring-1 ring-gray-100 bg-white px-8 py-10 gap-6 grow min-w-[88%] scroll-snap-align-center relative ${
                  plan.highlight ? 'ring-2 ring-[#89CFF0]/20 shadow-lg scale-105' : ''
                }`}
                data-plan={plan.popular ? 'popular' : undefined}
              >
                {plan.popular && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 rounded-full bg-[#89CFF0] px-4 py-1 text-xs font-medium text-white shadow-md">
                    <Star size={14} className="mr-1" />
                    Populairste keuze
                  </div>
                )}
                
                {/* Card content */}
                <div className="text-center">
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
                
                <ul className="space-y-4">
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
                  variant="primary"
                  size="lg"
                  fullWidth
                  className="cta-btn"
                >
                  {plan.cta}
                </Button>
              </div>
            ))}
          </div>
          
          <div className="hidden sm:grid max-w-5xl mx-auto sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-12 mb-16" data-kind="pricing">
            {plans.map((plan) => (
              <div 
                key={plan.id} 
                className={`flex flex-col rounded-3xl shadow-lg/10 ring-1 ring-gray-100 bg-white px-8 py-10 gap-6 grow relative transition-all hover:shadow-lg ${
                  plan.highlight ? 'ring-2 ring-[#89CFF0]/20 shadow-lg scale-105' : ''
                }`}
                data-plan={plan.popular ? 'popular' : undefined}
              >
                {plan.popular && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 rounded-full bg-[#89CFF0] px-4 py-1 text-xs font-medium text-white shadow-md">
                    <Star size={14} className="mr-1" />
                    Populairste keuze
                  </div>
                )}
                
                <div className="text-center">
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
                
                <ul className="space-y-4">
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
                  variant="primary"
                  size="lg"
                  fullWidth
                  className="cta-btn"
                >
                  {plan.cta}
                </Button>
              </div>
            ))}
          </div>
        </ErrorBoundary>

        {/* FAQ Section */}
        <ErrorBoundary>
          <section className="bg-white rounded-3xl shadow-sm p-8 md:p-12 mb-16">
            <h2 className="text-2xl font-medium text-[#0D1B2A] text-center mb-8">
              Veelgestelde vragen over prijzen
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-medium text-[#0D1B2A] mb-2">Kan ik op elk moment opzeggen?</h3>
                <p className="text-gray-600 text-sm">Ja, je kunt je abonnement op elk moment opzeggen. Geen verborgen kosten of lange contracten.</p>
              </div>
              
              <div>
                <h3 className="font-medium text-[#0D1B2A] mb-2">Hoe werkt de geld-terug garantie?</h3>
                <p className="text-gray-600 text-sm">Niet tevreden binnen 14 dagen? Krijg je geld terug, geen vragen gesteld.</p>
              </div>
              
              <div>
                <h3 className="font-medium text-[#0D1B2A] mb-2">Welke betaalmethoden accepteren jullie?</h3>
                <p className="text-gray-600 text-sm">iDEAL, creditcard, PayPal en bankoverschrijving. Alle betalingen zijn beveiligd.</p>
              </div>
              
              <div>
                <h3 className="font-medium text-[#0D1B2A] mb-2">Kan ik later upgraden?</h3>
                <p className="text-gray-600 text-sm">Ja, je kunt op elk moment upgraden. Je betaalt alleen het verschil voor de resterende periode.</p>
              </div>
            </div>
          </section>
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
      </section>
      <div className="pb-24"></div>
    </div>
  );
};

export default PricingPage;