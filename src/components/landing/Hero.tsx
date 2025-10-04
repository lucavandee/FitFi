// src/components/landing/Hero.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Shield, Clock, Sparkles, Zap, Heart } from 'lucide-react';
import Container from '../layout/Container';
import SmartImage from '../media/SmartImage';

/**
 * Hero sectie — opt-in polish via ff-utilities.
 * Geen gradients/overrides; we raken alleen markup/classes aan.
 */
export default function Hero() {
  const navigate = useNavigate();

  const handleStartQuiz = () => {
    navigate('/quiz');
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-canvas)] py-12 md:py-20">
      <div className="ff-container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-full border border-emerald-200/50 mb-8">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-700">GRATIS AI STYLE REPORT</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight font-sans">
              Ontdek wat jouw{' '}
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 bg-clip-text text-transparent">
                perfecte stijl is
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl leading-relaxed">
              Beantwoord 6 korte vragen en krijg direct een persoonlijk stijlprofiel met concrete outfits en shoplinks.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <NavLink 
                to="/quiz" 
                className="ff-btn ff-btn-primary px-8 py-3 text-lg font-medium"
              >
                Start gratis
              </NavLink>
              <NavLink 
                to="/hoe-het-werkt" 
                className="ff-btn ff-btn-ghost px-8 py-3 text-lg font-medium"
              >
                Hoe het werkt
              </NavLink>
            </div>
            
            {/* Trust indicators */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mt-8 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>100% Gratis</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-500" />
                <span>Privacy-first</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                <span>2 minuten setup</span>
              </div>
            </div>
          </div>
          
          {/* Hero Image with floating elements */}
          <div className="relative lg:w-1/2 mt-12 lg:mt-0">
            <div className="relative">
              {/* Main phone mockup */}
              <div className="relative mx-auto max-w-sm transform hover:scale-105 transition-transform duration-700">
                <SmartImage
                  src="/hero/style-report.webp"
                  alt="FitFi AI Style Report voorbeeld"
                  className="w-full h-auto rounded-3xl shadow-2xl ring-1 ring-gray-200/50"
                  priority
                />
                
                {/* Glow effect behind phone */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 via-teal-400/20 to-blue-400/20 rounded-3xl blur-3xl -z-10 scale-110"></div>
              </div>
              
              {/* Floating feature cards - positioned outside phone */}
              <div className="absolute -top-6 -left-8 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-4 border border-gray-100/50 transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Heart className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">Archetype</div>
                    <div className="text-xs text-gray-500">Jouw unieke stijl</div>
                  </div>
                </div>
              </div>
              
              <div className="absolute top-1/2 -right-12 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-4 border border-gray-100/50 transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">Outfits</div>
                    <div className="text-xs text-gray-500">Persoonlijke looks</div>
                  </div>
                </div>
              </div>
              
              <div className="absolute -bottom-6 left-4 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-4 border border-gray-100/50 transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">AI Powered</div>
                    <div className="text-xs text-gray-500">Slimme analyse</div>
                  </div>
                </div>
              </div>
              
              {/* Subtle floating particles */}
              <div className="absolute top-8 right-8 w-2 h-2 bg-emerald-400 rounded-full animate-pulse opacity-60"></div>
              <div className="absolute bottom-16 left-8 w-1 h-1 bg-teal-400 rounded-full animate-pulse opacity-40 animation-delay-1000"></div>
              <div className="absolute top-1/3 right-4 w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse opacity-50 animation-delay-2000"></div>
            </div>
          </div>
        </div>
        
        {/* Trust indicators */}
        <div className="mt-16 pt-8 border-t border-[var(--color-border)]">
          <div className="text-center">
            <p className="text-sm text-[var(--color-muted)] mb-4">Vertrouwd door stijlbewuste mensen</p>
            <div className="flex items-center justify-center gap-8 opacity-60">
              <div className="text-xs font-medium text-[var(--color-text)]">Premium kwaliteit</div>
              <div className="w-px h-4 bg-[var(--color-border)]" />
              <div className="text-xs font-medium text-[var(--color-text)]">Privacy-first</div>
              <div className="w-px h-4 bg-[var(--color-border)]" />
              <div className="text-xs font-medium text-[var(--color-text)]">Direct resultaat</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-emerald-100/30 to-teal-100/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-teal-100/20 to-blue-100/20 rounded-full blur-3xl"></div>
      </div>
    </section>
  );
}