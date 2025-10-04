import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, CheckCircle, Shield, Clock } from 'lucide-react';
import SmartImage from '../media/SmartImage';

const Hero: React.FC = () => {
  const navigate = useNavigate();

  const handleStartQuiz = () => {
    navigate('/quiz');
  };

  const handleViewExample = () => {
    navigate('/results');
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[var(--color-bg)] via-[var(--color-bg-soft)] to-[var(--color-surface)]">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-teal-400/20 to-blue-400/20 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-emerald-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse-slow"></div>
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="text-center lg:text-left space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-surface)] backdrop-blur-sm border border-[var(--color-border)] rounded-full text-sm font-medium text-[var(--color-text-muted)] shadow-sm">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              GRATIS AI STYLE REPORT
            </div>

            {/* Main headline */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--color-text)] leading-tight">
                Ontdek wat jouw{' '}
                <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 bg-clip-text text-transparent">
                  perfecte stijl
                </span>{' '}
                is
              </h1>
              
              <p className="text-lg md:text-xl text-[var(--color-text-muted)] max-w-2xl leading-relaxed">
                Binnen 2 minuten krijg je een persoonlijk rapport met uitleg, 
                kleuren en 6–12 outfits. <strong>Rustig, duidelijk en zonder gedoe.</strong>
              </p>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                onClick={handleStartQuiz}
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/25"
              >
                Start gratis
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>
              
              <button
                onClick={handleViewExample}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent hover:bg-[var(--color-surface)] text-[var(--color-text)] font-semibold rounded-xl border border-[var(--color-border)] transition-all duration-300 hover:scale-105 hover:border-[var(--color-primary)]"
              >
                Bekijk voorbeeldrapport
              </button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-4">
              <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                100% Gratis
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                <Shield className="w-4 h-4 text-blue-500" />
                Privacy-first
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                <Clock className="w-4 h-4 text-purple-500" />
                2 min setup
              </div>
            </div>
          </div>

          {/* Right content - Phone mockup with floating elements */}
          <div className="relative flex justify-center lg:justify-end">
            {/* Phone container with glow effect */}
            <div className="relative">
              {/* Glow effect behind phone */}
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/30 via-teal-400/30 to-blue-400/30 rounded-[3rem] blur-2xl scale-110 animate-pulse-slow"></div>
              
              {/* Phone mockup */}
              <div className="relative bg-[var(--color-surface)] rounded-[3rem] p-2 shadow-2xl backdrop-blur-sm border border-[var(--color-border)]/50">
                <SmartImage
                  src="/hero/style-report.webp"
                  alt="FitFi Style Report voorbeeld"
                  className="w-full max-w-sm rounded-[2.5rem] shadow-lg"
                  priority
                />
              </div>
            </div>

            {/* Floating elements positioned around phone */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Archetype card - top left */}
              <div className="absolute top-8 -left-4 lg:left-8 bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-white/20 animate-float max-w-[160px]">
                <div className="text-xs font-medium text-gray-600 mb-1">Archetype</div>
                <div className="text-sm font-bold text-gray-900">Modern Minimal</div>
              </div>

              {/* Outfits card - top right */}
              <div className="absolute top-16 -right-4 lg:right-8 bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-white/20 animate-float-delayed max-w-[140px]">
                <div className="text-xs font-medium text-gray-600 mb-1">Outfits</div>
                <div className="text-sm font-bold text-gray-900">6-12 looks</div>
              </div>

              {/* AI Powered card - bottom left */}
              <div className="absolute bottom-16 -left-4 lg:left-8 bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-white/20 animate-float-reverse max-w-[160px]">
                <div className="text-xs font-medium text-gray-600 mb-1">AI Powered</div>
                <div className="text-sm font-bold text-gray-900">Smart matching</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;