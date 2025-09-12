import React from "react";
import { Link } from "react-router-dom";

interface PremiumHeroProps {
  title: string;
  subtitle: string;
  ctaText?: string;
  ctaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
}

export default function PremiumHero({
  title,
  subtitle,
  ctaText = "Start gratis",
  ctaLink = "/register",
  secondaryCtaText = "Meer info",
  secondaryCtaLink = "/how-it-works"
}: PremiumHeroProps) {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden ff-hero-card">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#2B6AF3]/10 via-transparent to-[#67E8F9]/5"></div>
      
      {/* Floating elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-[#2B6AF3]/20 rounded-full blur-3xl ff-float"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-[#67E8F9]/15 rounded-full blur-3xl ff-float" style={{ animationDelay: '2s' }}></div>
      
      <div className="ff-container relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-white font-bold mb-6 leading-tight">
            {title}
          </h1>
          
          <p className="text-xl text-[#AAB0C0] mb-10 leading-relaxed max-w-2xl mx-auto">
            {subtitle}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to={ctaLink} className="ff-cta text-lg px-8 py-4">
              {ctaText}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            
            <Link to={secondaryCtaLink} className="ff-ghost text-lg px-8 py-4">
              {secondaryCtaText}
            </Link>
          </div>
          
          <div className="mt-12 flex items-center justify-center gap-8 text-sm text-[#AAB0C0]">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#22C55E] rounded-full"></div>
              <span>AI-powered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#22C55E] rounded-full"></div>
              <span>Gratis te proberen</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#22C55E] rounded-full"></div>
              <span>Nederlandse merken</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}