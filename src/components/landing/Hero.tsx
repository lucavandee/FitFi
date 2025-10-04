// src/components/landing/Hero.tsx
import React from "react";
import { NavLink } from "react-router-dom";
import SmartImage from "@/components/ui/SmartImage";

/**
 * Hero sectie — opt-in polish via ff-utilities.
 * Geen gradients/overrides; we raken alleen markup/classes aan.
 */
export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-canvas)] py-12 md:py-20">
      <div className="ff-container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1 text-[var(--color-muted)] text-sm mb-6">
              ✨ AI-gedreven stijladvies
            </div>
            
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--color-text)] leading-tight mb-6">
              Jouw persoonlijke
              <span className="block text-[var(--ff-color-primary-600)]">Style Report</span>
            </h1>
            
            <p className="text-lg text-[var(--color-muted)] mb-8 max-w-xl mx-auto lg:mx-0">
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
            
            <p className="text-sm text-[var(--color-muted)] mt-4">
              Geen account nodig • Privacy-first • Direct resultaat
            </p>
          </div>
          
          {/* Hero Image */}
          <div className="relative">
            <div className="relative mx-auto max-w-sm lg:max-w-md">
              src="/images/hero-highres copy.png"
                src="/images/hero-highres copy.png"
                alt="FitFi Style Report interface op iPhone met aardse tinten outfit aanbevelingen"
                className="w-full h-auto rounded-2xl shadow-2xl"
                loading="eager"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 400px"
              />
              
              {/* Subtle glow effect */}
              <div 
                className="absolute inset-0 rounded-2xl opacity-20 blur-xl"
                style={{
                  background: "radial-gradient(circle at center, var(--ff-color-primary-400), transparent 70%)"
                }}
                aria-hidden="true"
              />
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
    </section>
  );
}