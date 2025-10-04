import React from 'react';
import { MessageSquare, Sparkles, ShoppingBag, ArrowRight } from 'lucide-react';

const HowItWorks: React.FC = () => {
  const steps = [
    {
      number: '01',
      icon: MessageSquare,
      title: 'Beantwoord 8 vragen',
      description: 'Vertel ons over jouw voorkeuren, levensstijl en wat je mooi vindt. Duurt maar 2 minuten.',
      gradient: 'from-emerald-500 to-teal-500'
    },
    {
      number: '02',
      icon: Sparkles,
      title: 'AI analyseert jouw stijl',
      description: 'Onze geavanceerde AI verwerkt jouw antwoorden en creëert een uniek stijlprofiel voor jou.',
      gradient: 'from-teal-500 to-blue-500'
    },
    {
      number: '03',
      icon: ShoppingBag,
      title: 'Ontvang jouw rapport',
      description: 'Krijg direct je persoonlijke stijlrapport met kleuren, archetype en 6-12 complete outfits.',
      gradient: 'from-blue-500 to-purple-500'
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-[var(--color-bg)] via-[var(--color-bg-soft)] to-[var(--color-surface)] relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-emerald-400/10 to-teal-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-teal-400/10 to-blue-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-surface)] backdrop-blur-sm border border-[var(--color-border)] rounded-full text-sm font-medium text-[var(--color-text-muted)] shadow-sm mb-6">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            HOE HET WERKT
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--color-text)] mb-6">
            Van vraag tot{' '}
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 bg-clip-text text-transparent">
              perfecte stijl
            </span>
          </h2>
          
          <p className="text-lg text-[var(--color-text-muted)] max-w-3xl mx-auto leading-relaxed">
            In drie simpele stappen krijg je een compleet stijlrapport dat perfect bij jou past. 
            Geen gedoe, gewoon resultaat.
          </p>
        </div>

        {/* Steps */}
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isLast = index === steps.length - 1;
              
              return (
                <div key={index} className="relative">
                  {/* Step card */}
                  <div className="group relative bg-[var(--color-surface)] backdrop-blur-sm border border-[var(--color-border)] rounded-2xl p-8 hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10">
                    {/* Step number */}
                    <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {step.number}
                    </div>

                    {/* Icon */}
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${step.gradient} mb-6 shadow-lg`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-bold text-[var(--color-text)] mb-4 group-hover:text-emerald-600 transition-colors">
                      {step.title}
                    </h3>
                    
                    <p className="text-[var(--color-text-muted)] leading-relaxed">
                      {step.description}
                    </p>

                    {/* Hover effect overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>

                  {/* Arrow connector (desktop only) */}
                  {!isLast && (
                    <div className="hidden lg:block absolute top-1/2 -right-6 transform -translate-y-1/2 z-10">
                      <ArrowRight className="w-6 h-6 text-[var(--color-text-muted)]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-lg text-[var(--color-text-muted)] mb-6">
            Klaar om jouw perfecte stijl te ontdekken?
          </p>
          <button className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/25">
            Start nu gratis
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;