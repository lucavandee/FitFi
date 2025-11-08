import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, CircleCheck as CheckCircle, Shield, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useUser } from '@/context/UserContext';

export function Hero() {
  const { user } = useUser();
  const navigate = useNavigate();

  const handleStartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (user) {
      navigate('/onboarding');
    } else {
      navigate('/register');
    }
  };
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-[var(--ff-color-bg)] via-[var(--ff-color-bg-subtle)] to-[var(--ff-color-accent-50)] overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-[var(--ff-color-primary-200)] to-[var(--ff-color-accent-200)] rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-gradient-to-r from-[var(--ff-color-accent-200)] to-[var(--ff-color-secondary-200)] rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float-delayed"></div>
        <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-gradient-to-r from-[var(--ff-color-secondary-200)] to-[var(--ff-color-primary-200)] rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float-slow"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[80vh]">
          {/* Left Column - Content */}
          <div className="text-center lg:text-left space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--ff-color-surface)] backdrop-blur-sm border border-[var(--ff-color-border)] rounded-full shadow-sm">
              <Sparkles className="w-4 h-4 text-[var(--ff-color-primary-600)]" />
              <span className="text-sm font-medium text-[var(--ff-color-text-secondary)]">
                GRATIS AI STYLE REPORT
              </span>
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--ff-color-text)] leading-tight">
                Ontdek wat{' '}
                <span className="bg-gradient-to-r from-[var(--ff-color-primary-600)] via-[var(--ff-color-accent-600)] to-[var(--ff-color-secondary-600)] bg-clip-text text-transparent">
                  jouw stijl is
                </span>
              </h1>
              
              <p className="text-lg sm:text-xl text-[var(--ff-color-text-secondary)] max-w-2xl">
                Binnen 2 minuten krijg je een persoonlijk rapport met uitleg, 
                kleuren en 6–12 outfits. <strong>Helder uitgelegd, direct toepasbaar.</strong>
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                onClick={handleStartClick}
                size="lg"
                className="bg-[var(--ff-color-primary-700)] hover:bg-[var(--ff-color-primary-600)] text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                Start 2-min stijlquiz
                <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>

              <Button
                as={NavLink}
                to="/results/preview"
                variant="ghost"
                size="lg"
                className="border border-[var(--ff-color-border)] hover:border-[var(--ff-color-primary-300)] px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
              >
                Zie voorbeeldrapport
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-6 pt-4">
              <div className="flex items-center gap-2 text-sm text-[var(--ff-color-text-secondary)]">
                <CheckCircle className="w-5 h-5 text-[var(--ff-color-success-600)]" />
                <span>100% Gratis</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--ff-color-text-secondary)]">
                <Shield className="w-5 h-5 text-[var(--ff-color-primary-600)]" />
                <span>Privacy-first</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--ff-color-text-secondary)]">
                <Clock className="w-5 h-5 text-[var(--ff-color-accent-600)]" />
                <span>2 min setup</span>
              </div>
            </div>
          </div>

          {/* Right Column - Phone Mockup with Floating Elements */}
          <div className="relative flex justify-center lg:justify-end">
            {/* Main Phone Container */}
            <div className="relative">
              {/* Phone Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--ff-color-primary-400)] via-[var(--ff-color-accent-400)] to-[var(--ff-color-secondary-400)] rounded-[3rem] blur-2xl opacity-20 scale-110"></div>
              
              {/* Phone Mockup */}
              <div className="relative bg-[var(--ff-color-surface)] rounded-[3rem] p-2 shadow-2xl border border-[var(--ff-color-border)]">
                <div className="bg-gradient-to-br from-[var(--ff-color-bg-subtle)] to-[var(--ff-color-accent-50)] rounded-[2.5rem] overflow-hidden">
                  <img 
                    src="/hero/style-report.webp" 
                    alt="FitFi Style Report Preview"
                    className="w-full h-auto max-w-sm"
                    loading="eager"
                  />
                </div>
              </div>

              {/* Floating Cards - Positioned AROUND the phone */}
              
              {/* Archetype Card - Top Left */}
              <div className="absolute -top-4 -left-16 lg:-left-24 animate-float">
                <div className="bg-[var(--ff-color-surface)]/90 backdrop-blur-md border border-[var(--ff-color-border)] rounded-xl px-4 py-3 shadow-lg hover:scale-105 transition-transform duration-300">
                  <div className="text-xs text-[var(--ff-color-text-secondary)] font-medium">Archetype</div>
                  <div className="text-sm font-semibold text-[var(--ff-color-text)]">Modern Minimal</div>
                </div>
              </div>

              {/* Outfits Card - Top Right */}
              <div className="absolute -top-8 -right-12 lg:-right-20 animate-float-delayed">
                <div className="bg-[var(--ff-color-surface)]/90 backdrop-blur-md border border-[var(--ff-color-border)] rounded-xl px-4 py-3 shadow-lg hover:scale-105 transition-transform duration-300">
                  <div className="text-xs text-[var(--ff-color-text-secondary)] font-medium">Outfits</div>
                  <div className="text-sm font-semibold text-[var(--ff-color-text)]">6-12 looks</div>
                </div>
              </div>

              {/* AI Powered Card - Bottom Left */}
              <div className="absolute -bottom-4 -left-12 lg:-left-20 animate-float-slow">
                <div className="bg-[var(--ff-color-surface)]/90 backdrop-blur-md border border-[var(--ff-color-border)] rounded-xl px-4 py-3 shadow-lg hover:scale-105 transition-transform duration-300">
                  <div className="text-xs text-[var(--ff-color-text-secondary)] font-medium">AI Powered</div>
                  <div className="text-sm font-semibold text-[var(--ff-color-text)]">Smart matching</div>
                </div>
              </div>

              {/* Color Palette Card - Bottom Right */}
              <div className="absolute -bottom-8 -right-8 lg:-right-16 animate-float">
                <div className="bg-[var(--ff-color-surface)]/90 backdrop-blur-md border border-[var(--ff-color-border)] rounded-xl px-4 py-3 shadow-lg hover:scale-105 transition-transform duration-300">
                  <div className="text-xs text-[var(--ff-color-text-secondary)] font-medium">Kleuren</div>
                  <div className="flex gap-1 mt-1">
                    <div className="w-3 h-3 rounded-full bg-[var(--ff-color-primary-400)]"></div>
                    <div className="w-3 h-3 rounded-full bg-[var(--ff-color-accent-400)]"></div>
                    <div className="w-3 h-3 rounded-full bg-[var(--ff-color-secondary-400)]"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}