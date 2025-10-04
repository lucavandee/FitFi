import React from 'react';
import { ArrowRight, CircleCheck as CheckCircle, Shield, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SmartImage from '../media/SmartImage';

const Hero: React.FC = () => {
  const navigate = useNavigate();

  const handleStartQuiz = () => {
    navigate('/quiz');
  };

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-[var(--color-bg)] via-[var(--color-surface)] to-[var(--color-bg)] overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-200/20 to-teal-200/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-200/20 to-emerald-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[80vh]">
          
          {/* Left Content */}
          <div className="space-y-8 lg:pr-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/50 rounded-full text-sm font-medium text-emerald-700">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              GRATIS AI STYLE REPORT
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--color-text)] leading-tight">
                Ontdek wat jouw{' '}
                <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 bg-clip-text text-transparent">
                  perfecte stijl
                </span>{' '}
                is
              </h1>
              
              <p className="text-lg sm:text-xl text-[var(--color-text-muted)] leading-relaxed max-w-xl">
                Binnen 2 minuten krijg je een persoonlijk rapport met uitleg, 
                kleuren en 6–12 outfits. <strong className="text-[var(--color-text)]">Rustig, duidelijk en zonder gedoe.</strong>
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleStartQuiz}
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-[var(--color-primary)] to-emerald-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                Start gratis
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/80 backdrop-blur-sm border border-[var(--color-border)] text-[var(--color-text)] font-semibold rounded-2xl hover:bg-white hover:shadow-lg transition-all duration-300">
                Bekijk voorbeeldrapport
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center gap-6 pt-4">
              <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                100% Gratis
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                <Shield className="w-5 h-5 text-blue-500" />
                Privacy-first
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                <Clock className="w-5 h-5 text-purple-500" />
                2 min setup
              </div>
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative lg:pl-8">
            {/* Main Phone Container */}
            <div className="relative mx-auto max-w-sm">
              {/* Phone Shadow/Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-200/30 to-blue-200/30 rounded-[3rem] blur-2xl scale-110"></div>
              
              {/* Phone Frame */}
              <div className="relative bg-gradient-to-br from-[var(--color-surface)] to-white rounded-[3rem] p-2 shadow-2xl border border-white/50">
                <div className="bg-[#F7F3EC] rounded-[2.5rem] overflow-hidden">
                  <SmartImage
                    src="/hero/style-report.webp"
                    alt="FitFi AI Style Report voorbeeld"
                    className="w-full h-auto"
                    priority
                  />
                </div>
              </div>
            </div>

            {/* Floating Feature Cards - Positioned OUTSIDE phone */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Archetype Card - Top Left */}
              <div className="absolute -top-4 -left-8 lg:-left-16 animate-float-slow">
                <div className="bg-white/90 backdrop-blur-sm border border-white/50 rounded-2xl px-4 py-3 shadow-lg">
                  <div className="text-xs font-medium text-[var(--color-text-muted)] mb-1">Archetype</div>
                  <div className="text-sm font-semibold text-[var(--color-text)]">Modern Minimalist</div>
                </div>
              </div>

              {/* Outfits Card - Top Right */}
              <div className="absolute -top-8 -right-4 lg:-right-12 animate-float-medium">
                <div className="bg-white/90 backdrop-blur-sm border border-white/50 rounded-2xl px-4 py-3 shadow-lg">
                  <div className="text-xs font-medium text-[var(--color-text-muted)] mb-1">Outfits</div>
                  <div className="text-sm font-semibold text-[var(--color-text)]">6-12 looks</div>
                </div>
              </div>

              {/* AI Powered Card - Bottom Left */}
              <div className="absolute -bottom-4 -left-4 lg:-left-12 animate-float-fast">
                <div className="bg-white/90 backdrop-blur-sm border border-white/50 rounded-2xl px-4 py-3 shadow-lg">
                  <div className="text-xs font-medium text-[var(--color-text-muted)] mb-1">AI Powered</div>
                  <div className="text-sm font-semibold text-[var(--color-text)]">Smart matching</div>
                </div>
              </div>

              {/* Color Palette Card - Bottom Right */}
              <div className="absolute -bottom-8 -right-8 lg:-right-16 animate-float-slow">
                <div className="bg-white/90 backdrop-blur-sm border border-white/50 rounded-2xl px-4 py-3 shadow-lg">
                  <div className="text-xs font-medium text-[var(--color-text-muted)] mb-1">Kleuren</div>
                  <div className="flex gap-1 mt-1">
                    <div className="w-4 h-4 bg-amber-200 rounded-full border border-white"></div>
                    <div className="w-4 h-4 bg-amber-600 rounded-full border border-white"></div>
                    <div className="w-4 h-4 bg-amber-800 rounded-full border border-white"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;