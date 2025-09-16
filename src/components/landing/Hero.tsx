import React from 'react';
import { ArrowRight, CheckCircle, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { track } from '@/utils/analytics';

export default function Hero() {
  const handleCTAClick = () => {
    track('cta_click', { location: 'hero', action: 'start_quiz' });
  };

  return (
    <section className="relative py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[color:var(--color-accent)] text-[color:var(--color-text)] text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              AI-Powered Styling
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[color:var(--color-text)] mb-6 leading-tight">
              Ontdek jouw perfecte
              <span className="block text-[color:var(--color-primary)]">
                stijl met AI
              </span>
            </h1>
            
            <p className="text-xl text-[color:var(--color-muted)] mb-8 max-w-2xl mx-auto lg:mx-0">
              Van persoonlijkheidstest tot gepersonaliseerde outfits. 
              Laat onze AI je helpen om je unieke stijl te ontdekken.
            </p>

            {/* Benefits */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-center lg:justify-start">
              <div className="flex items-center gap-2 text-[color:var(--color-success)]">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Gratis persoonlijkheidstest</span>
              </div>
              <div className="flex items-center gap-2 text-[color:var(--color-success)]">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">AI-gepersonaliseerde outfits</span>
              </div>
              <div className="flex items-center gap-2 text-[color:var(--color-success)]">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Nederlandse merken</span>
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                to="/quiz"
                onClick={handleCTAClick}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[color:var(--ff-color-primary-700)] text-white font-bold rounded-lg hover:bg-[color:var(--ff-color-primary-600)] transition-colors duration-200 shadow-lg"
              >
                Start je stijlreis
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/how-it-works"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-[color:var(--color-border)] text-[color:var(--color-text)] font-semibold rounded-lg hover:bg-[color:var(--color-accent)] transition-colors duration-200"
              >
                Hoe werkt het?
              </Link>
            </div>
          </div>

          {/* Visual */}
          <div className="relative">
            <div className="relative bg-[color:var(--color-surface)] rounded-3xl border border-[color:var(--color-border)] shadow-2xl overflow-hidden">
              <div className="aspect-[4/5] bg-gradient-to-br from-[color:var(--color-accent)] to-[color:var(--color-primary)] p-8 flex items-center justify-center">
                <img
                  src="/images/nova.svg"
                  alt="FitFi Nova AI Assistant"
                  className="w-32 h-32 object-contain"
                />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-[color:var(--color-text)] mb-2">
                  Nova AI Assistant
                </h3>
                <p className="text-[color:var(--color-muted)] text-sm">
                  Jouw persoonlijke styling-expert die je helpt bij elke outfit keuze.
                </p>
              </div>
            </div>
            
            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-[color:var(--color-primary)] rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-[color:var(--color-accent)] rounded-full opacity-30 animate-pulse delay-1000"></div>
          </div>
        </div>
      </div>
    </section>
  );
}