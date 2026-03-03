import React from 'react';
import { MessageSquare, Sparkles, ShoppingBag, ArrowRight } from 'lucide-react';

const HowItWorks: React.FC = () => {
  const steps = [
    {
      number: '01',
      icon: MessageSquare,
      title: 'Beantwoord 8 vragen',
      description: 'Vertel ons over jouw voorkeuren, levensstijl en wat je mooi vindt. Duurt maar 2 minuten.',
    },
    {
      number: '02',
      icon: Sparkles,
      title: 'AI analyseert jouw stijl',
      description: 'Onze AI verwerkt jouw antwoorden en creëert een uniek stijlprofiel voor jou.',
    },
    {
      number: '03',
      icon: ShoppingBag,
      title: 'Ontvang jouw rapport',
      description: 'Krijg direct je persoonlijke stijlrapport met kleuren, archetype en 6-12 complete outfits.',
    }
  ];

  return (
    <section className="ff-section bg-[var(--color-bg)] relative overflow-hidden">
      <div className="ff-container relative z-10">
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full text-sm font-semibold text-[var(--color-muted)] shadow-[var(--shadow-soft)] mb-6">
            <Sparkles className="w-4 h-4 text-[var(--ff-color-primary-600)]" aria-hidden="true" />
            HOE HET WERKT
          </div>

          <h2 className="font-heading font-bold tracking-tight text-[var(--color-text)] mb-4"
              style={{ fontSize: 'clamp(1.75rem, 3vw + 1rem, 2.75rem)', lineHeight: 1.1 }}>
            Van vraag tot{' '}
            <span className="bg-clip-text text-transparent"
                  style={{ backgroundImage: 'linear-gradient(90deg, var(--ff-color-primary-600), var(--ff-color-primary-700))' }}>
              jouw stijlrapport
            </span>
          </h2>

          <p className="text-base md:text-lg text-[var(--color-muted)] max-w-2xl mx-auto leading-relaxed font-light">
            In drie simpele stappen krijg je een compleet stijlrapport.
            Helder, direct en toepasbaar.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isLast = index === steps.length - 1;

              return (
                <div key={index} className="relative">
                  <div className="group relative bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 md:p-8 transition-all duration-300 shadow-[var(--shadow-soft)] hover:shadow-md hover:-translate-y-0.5">
                    <div className="absolute -top-4 -left-4 w-11 h-11 bg-[var(--ff-color-primary-700)] rounded-xl flex items-center justify-center text-white font-bold text-base shadow-md">
                      {step.number}
                    </div>

                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-5 shadow-sm"
                         style={{ background: 'linear-gradient(135deg, var(--ff-color-primary-600), var(--ff-color-primary-800))' }}
                         aria-hidden="true">
                      <Icon className="w-7 h-7 text-white" />
                    </div>

                    <h3 className="font-heading font-bold text-lg text-[var(--color-text)] mb-3">
                      {step.title}
                    </h3>

                    <p className="text-[var(--color-muted)] leading-relaxed text-sm md:text-base">
                      {step.description}
                    </p>
                  </div>

                  {!isLast && (
                    <div className="hidden md:block absolute top-1/2 -right-5 transform -translate-y-1/2 z-10">
                      <ArrowRight className="w-5 h-5 text-[var(--color-muted)]" aria-hidden="true" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-center mt-12 md:mt-16">
          <p className="text-base md:text-lg text-[var(--color-muted)] mb-6 font-light">
            Klaar om te beginnen?
          </p>
          <a
            href="/stijlquiz"
            className="group inline-flex items-center gap-2.5 px-8 py-4 min-h-[56px] rounded-xl font-bold text-base transition-all active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-500)]"
            style={{
              background: 'var(--ff-color-primary-700)',
              color: 'var(--color-bg)',
              boxShadow: '0 8px 40px rgba(166,136,106,0.45)',
            }}
          >
            Start nu gratis
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
