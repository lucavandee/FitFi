import React from 'react';
import { Clock, Heart, Sparkles, ShoppingBag, Check } from 'lucide-react';

const SocialProof: React.FC = () => {
  const benefits = [
    {
      title: 'Direct inzicht',
      description: 'Binnen 2 minuten weet je welke kleuren en stijlen bij je passen.',
      icon: Sparkles
    },
    {
      title: 'Complete outfits',
      description: 'Geen losse items, maar complete looks die je direct kunt shoppen.',
      icon: ShoppingBag
    },
    {
      title: 'Uitleg erbij',
      description: 'Begrijp waarom iets bij je past. Geen giswerk, wel inzicht.',
      icon: Check
    }
  ];

  const stats = [
    {
      number: '2 min',
      label: 'Van start tot rapport',
      icon: Clock
    },
    {
      number: '6-12',
      label: 'Complete outfits',
      icon: ShoppingBag
    },
    {
      number: '100%',
      label: 'Gratis te gebruiken',
      icon: Heart
    }
  ];

  return (
    <section className="py-24 bg-[var(--color-bg)]">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-surface)] backdrop-blur-sm border border-[var(--color-border)] rounded-full text-sm font-medium text-[var(--color-muted)] shadow-sm mb-6">
            <Sparkles className="w-4 h-4 text-[var(--ff-color-primary-600)]" />
            WAT ANDEREN ZEGGEN
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--color-text)] mb-6">
            Wat je krijgt met{' '}
            <span className="text-[var(--ff-color-primary-600)]">
              FitFi
            </span>
          </h2>

          <p className="text-lg text-[var(--color-muted)] max-w-3xl mx-auto leading-relaxed">
            Direct toepasbaar stijladvies, geen gedoe.
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="text-center group hover:scale-105 transition-all duration-300"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--ff-color-primary-100)] mb-4 shadow-sm">
                  <Icon className="w-7 h-7 text-[var(--ff-color-primary-700)]" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-[var(--color-text)] mb-2 group-hover:text-[var(--ff-color-primary-600)] transition-colors">
                  {stat.number}
                </div>
                <div className="text-[var(--color-muted)] font-medium">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Benefits */}
        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div
                key={index}
                className="group relative bg-[var(--color-surface)] backdrop-blur-sm border border-[var(--color-border)] rounded-2xl p-8 hover:scale-105 transition-all duration-300 hover:shadow-lg"
              >
                <div className="w-12 h-12 rounded-full bg-[var(--ff-color-primary-100)] flex items-center justify-center mb-6">
                  <Icon className="w-6 h-6 text-[var(--ff-color-primary-600)]" />
                </div>

                <h3 className="text-xl font-bold text-[var(--color-text)] mb-3 group-hover:text-[var(--ff-color-primary-600)] transition-colors">
                  {benefit.title}
                </h3>

                <p className="text-[var(--color-muted)] leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SocialProof;