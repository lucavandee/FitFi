import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Seo from '@/components/Seo';
import { Check, Star, ArrowRight, Sparkles, Crown, Zap } from 'lucide-react';
import Button from '@/components/ui/Button';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useABTesting, trackPricingPopular } from '@/hooks/useABTesting';

const PricingPage: React.FC = () => {
  const { pricingHighlight } = useABTesting();

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
        'Diepgaand stijlrapport',
        'Stijlcoach prompts',
        'Prioriteit support'
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
        'Onbeperkte teamleden'
      ],
      cta: 'Kies Pro',
      ctaLink: '/registreren?plan=pro',
      popular: false,
      highlight: false,
      savings: '77% besparing'
    }
  ];

  return (
    <ErrorBoundary>
      <Seo title="Prijzen — FitFi" description="Kies jouw stijlupgrade. Start gratis en upgrade wanneer je klaar bent." />
      <Helmet><meta name="robots" content="index,follow" /></Helmet>

      <section className="bg-[color:var(--color-bg)]">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="ff-heading text-4xl sm:text-5xl font-extrabold text-[color:var(--color-text)]">Kies jouw stijlupgrade</h1>
            <p className="text-xl text-[color:var(--color-muted)] max-w-3xl mx-auto mt-4 leading-relaxed">
              Start gratis en upgrade wanneer je klaar bent. 14 dagen geld-terug garantie.
            </p>
          </div>

          {/* Cards */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`ff-card relative p-6 flex flex-col justify-between ${plan.highlight ? 'ring-2 ring-[color:var(--color-primary)]' : ''}`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[color:var(--color-surface)] border border-[color:var(--color-border)] rounded-full px-3 py-1 text-xs font-medium text-[color:var(--color-text)] shadow-[var(--shadow-soft)]">
                    <Star size={14} className="inline mr-1" />
                    Populairste keuze
                  </div>
                )}

                <div>
                  <div className="mb-3 text-[color:var(--color-text)] flex items-center gap-2">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[color:var(--color-surface)] border border-[color:var(--color-border)]">{plan.icon}</span>
                    <h3 className="text-2xl font-semibold">{plan.name}</h3>
                  </div>
                  <div className="mb-4">
                    <span className="text-4xl font-light text-[color:var(--color-text)]">{plan.price}</span>
                    <span className="text-[color:var(--color-muted)] ml-2">{plan.period}</span>
                  </div>
                  <p className="text-[color:var(--color-muted)] leading-relaxed mb-4">{plan.description}</p>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className="flex-shrink-0 mt-0.5" style={{ color: "var(--ff-color-primary-600)" }} size={18} />
                        <span className="text-[color:var(--color-text)]">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button as={Link} to={plan.ctaLink} variant="primary" size="lg" className="w-full mt-2">
                  {plan.cta}
                </Button>
              </div>
            ))}
          </div>

          {/* Banner */}
          <div className="mt-16 ff-card text-center p-8">
            <h2 className="ff-heading text-3xl font-semibold text-[color:var(--color-text)] mb-2">Nog niet zeker?</h2>
            <p className="text-[color:var(--color-muted)] mb-6">Probeer FitFi gratis en upgrade pas als je klaar bent.</p>
            <Button as={Link} to="/onboarding" variant="primary" size="lg" icon={<ArrowRight size={18} />} iconPosition="right">
              Start nu gratis
            </Button>
          </div>
        </div>
      </section>
    </ErrorBoundary>
  );
};

export default PricingPage;