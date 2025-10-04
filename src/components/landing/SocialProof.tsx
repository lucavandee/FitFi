import React from 'react';
import { Star, Users, Heart, Sparkles } from 'lucide-react';

const SocialProof: React.FC = () => {
  const testimonials = [
    {
      name: 'Emma van der Berg',
      role: 'Marketing Manager',
      content: 'Eindelijk weet ik welke kleuren me echt goed staan! Het rapport was zo duidelijk en de outfits zijn perfect voor mijn werk.',
      rating: 5,
      avatar: '👩🏼‍💼'
    },
    {
      name: 'Lars Janssen',
      role: 'Student',
      content: 'Als man had ik geen idee waar ik moest beginnen met stijl. FitFi heeft me echt geholpen om mijn eigen stijl te vinden.',
      rating: 5,
      avatar: '👨🏻‍🎓'
    },
    {
      name: 'Sophie Bakker',
      role: 'Ondernemer',
      content: 'De AI-analyse was verrassend accuraat. Ik herken mezelf helemaal in het stijlarchetype en de outfit-suggesties zijn spot-on.',
      rating: 5,
      avatar: '👩🏽‍💻'
    }
  ];

  const stats = [
    {
      number: '25.000+',
      label: 'Tevreden gebruikers',
      icon: Users
    },
    {
      number: '4.9/5',
      label: 'Gemiddelde beoordeling',
      icon: Star
    },
    {
      number: '98%',
      label: 'Zou FitFi aanbevelen',
      icon: Heart
    }
  ];

  return (
    <section className="py-24 bg-[var(--color-bg)]">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-surface)] backdrop-blur-sm border border-[var(--color-border)] rounded-full text-sm font-medium text-[var(--color-text-muted)] shadow-sm mb-6">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            WAT ANDEREN ZEGGEN
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--color-text)] mb-6">
            Duizenden mensen vonden{' '}
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 bg-clip-text text-transparent">
              hun perfecte stijl
            </span>
          </h2>
          
          <p className="text-lg text-[var(--color-text-muted)] max-w-3xl mx-auto leading-relaxed">
            Ontdek waarom zoveel mensen FitFi vertrouwen voor hun stijladvies.
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
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 mb-4 shadow-lg">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-[var(--color-text)] mb-2 group-hover:text-emerald-600 transition-colors">
                  {stat.number}
                </div>
                <div className="text-[var(--color-text-muted)] font-medium">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="group relative bg-[var(--color-surface)] backdrop-blur-sm border border-[var(--color-border)] rounded-2xl p-8 hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10"
            >
              {/* Rating stars */}
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Content */}
              <p className="text-[var(--color-text)] mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 flex items-center justify-center text-2xl">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold text-[var(--color-text)] group-hover:text-emerald-600 transition-colors">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-[var(--color-text-muted)]">
                    {testimonial.role}
                  </div>
                </div>
              </div>

              {/* Hover effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProof;