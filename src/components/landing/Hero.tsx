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
      navigate('/registreren');
    }
  };
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-[var(--ff-color-bg)] via-[var(--ff-color-bg-subtle)] to-[var(--ff-color-accent-50)] overflow-hidden">

      {/* ── MOBILE HERO IMAGE (hidden on lg+) ── */}
      <div className="relative lg:hidden">
        <div className="relative w-full" style={{ aspectRatio: '3/4' }}>
          <img
            src="/hero/hf_20260221_211319_a32928c5-35c0-46c6-be6e-cfa9d8747078.webp"
            alt="FitFi stijl"
            className="w-full h-full object-cover object-top"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/70 via-transparent to-transparent" />
        </div>
        <div className="px-6 py-8 bg-[#FAFAF8]">
          <h1 className="text-3xl font-bold text-[#1A1A1A] leading-tight mb-3">
            Wat is{' '}
            <span className="text-[#C2654A]">jouw stijl?</span>
          </h1>
          <p className="text-base text-[#4A4A4A] leading-relaxed mb-6">
            Vul een korte quiz in. Je krijgt een rapport met kleuren en outfits die bij je passen.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={handleStartClick}
              className="w-full bg-[#C2654A] hover:bg-[#A8513A] text-white font-semibold text-base py-3 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
            >
              Begin gratis
              <ArrowRight className="w-5 h-5" />
            </button>
            <NavLink
              to="/results/preview"
              className="w-full bg-white border border-[#E5E5E5] hover:border-[#C2654A] text-[#1A1A1A] font-medium text-base py-3 px-6 rounded-xl transition-colors duration-200 text-center"
            >
              Zie voorbeeldrapport
            </NavLink>
          </div>
          {!user && (
            <p className="text-sm text-[#8A8A8A] text-center mt-4">
              Al een account?{' '}
              <NavLink to="/inloggen" className="font-semibold text-[#C2654A] hover:text-[#A8513A] underline underline-offset-2 transition-colors">
                Direct inloggen
              </NavLink>
            </p>
          )}
        </div>
      </div>

      {/* ── DESKTOP LAYOUT (hidden on mobile) ── */}
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden hidden lg:block">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-[var(--ff-color-primary-200)] to-[var(--ff-color-accent-200)] rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-gradient-to-r from-[var(--ff-color-accent-200)] to-[var(--ff-color-secondary-200)] rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float-delayed"></div>
        <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-gradient-to-r from-[var(--ff-color-secondary-200)] to-[var(--ff-color-primary-200)] rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float-slow"></div>
      </div>

      <div className="relative hidden lg:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[80vh]">
          {/* Left Column - Content */}
          <div className="text-center lg:text-left space-y-8">
            {/* Removed marketing badge */}

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--ff-color-text)] leading-tight">
                Wat is{' '}
                <span className="bg-gradient-to-r from-[var(--ff-color-primary-600)] via-[var(--ff-color-accent-600)] to-[var(--ff-color-secondary-600)] bg-clip-text text-transparent">
                  jouw stijl?
                </span>
              </h1>
              
              <p className="text-lg sm:text-xl text-[var(--ff-color-text-secondary)] max-w-2xl">
                Vul een korte quiz in. Je krijgt een rapport met kleuren en outfits die bij je passen.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                onClick={handleStartClick}
                size="lg"
                className="w-full sm:w-auto bg-[var(--ff-color-primary-700)] hover:bg-[var(--ff-color-primary-600)] text-white px-6 py-3 rounded-xl font-semibold text-base transition-colors duration-200"
              >
                Start gratis stijlquiz
                <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>

              <Button
                as={NavLink}
                to="/results/preview"
                variant="ghost"
                size="lg"
                className="w-full sm:w-auto border border-[#E5E5E5] hover:border-[#C2654A] px-6 py-3 rounded-xl font-medium text-base transition-colors duration-200"
              >
                Zie voorbeeldrapport
              </Button>
            </div>

            {/* Returning user link */}
            {!user && (
              <p className="text-sm text-[var(--ff-color-text-secondary)] text-center lg:text-left">
                Al een account?{" "}
                <NavLink
                  to="/inloggen"
                  className="font-semibold text-[var(--ff-color-primary-700)] hover:text-[var(--ff-color-primary-600)] underline underline-offset-2 transition-colors"
                >
                  Direct inloggen
                </NavLink>
              </p>
            )}
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