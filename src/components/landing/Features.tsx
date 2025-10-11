import React from 'react';
import { Sparkles, Palette, ShoppingBag, Clock, Shield, Heart } from 'lucide-react';

const Features: React.FC = () => {
  const features = [
    {
      icon: Sparkles,
      title: 'Jouw eigen stijlprofiel',
      description: 'We analyseren jouw voorkeuren en maken een stijlprofiel dat bij jou past. Geen standaard antwoorden.',
      gradient: 'from-emerald-500 to-teal-500'
    },
    {
      icon: Palette,
      title: 'Jouw kleurenpalet',
      description: 'Ontdek welke kleuren bij jou passen. Met uitleg waarom, zodat je het zelf kunt toepassen.',
      gradient: 'from-teal-500 to-blue-500'
    },
    {
      icon: ShoppingBag,
      title: '6-12 complete outfits',
      description: 'Concrete outfit-combinaties die je direct kunt samenstellen. Met links naar webshops waar je ze vindt.',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Clock,
      title: 'Binnen 2 minuten klaar',
      description: 'Geen lange vragenlijsten. 8 simpele vragen, direct je rapport. Echt 2 minuten.',
      gradient: 'from-cyan-500 to-emerald-500'
    },
    {
      icon: Shield,
      title: '100% privacy',
      description: 'Je gegevens blijven van jou. We verkopen niks door, geen tracking, geen gedoe.',
      gradient: 'from-emerald-500 to-teal-500'
    },
    {
      icon: Heart,
      title: 'Echt gratis',
      description: 'Geen kosten, geen abonnement, geen creditcard nodig. Je complete rapport is gratis.',
      gradient: 'from-teal-500 to-blue-500'
    }
  ];

  return (
    <section className="py-24 bg-[var(--color-bg)]">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-surface)] backdrop-blur-sm border border-[var(--color-border)] rounded-full text-sm font-medium text-[var(--color-text-muted)] shadow-sm mb-6">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            WAAROM FITFI
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--color-text)] mb-6">
            Jouw stijl,{' '}
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 bg-clip-text text-transparent">
              binnen handbereik
            </span>
          </h2>
          
          <p className="text-lg text-[var(--color-text-muted)] max-w-3xl mx-auto leading-relaxed">
            Helder, persoonlijk en direct toepasbaar.
            Zo werkt FitFi.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group relative bg-[var(--color-surface)] backdrop-blur-sm border border-[var(--color-border)] rounded-2xl p-8 hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10"
              >
                {/* Icon with gradient background */}
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r ${feature.gradient} mb-6 shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-[var(--color-text)] mb-4 group-hover:text-emerald-600 transition-colors">
                  {feature.title}
                </h3>
                
                <p className="text-[var(--color-text-muted)] leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;