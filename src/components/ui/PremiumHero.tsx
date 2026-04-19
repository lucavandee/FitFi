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
  secondaryCtaLink = "/hoe-het-werkt"
}: PremiumHeroProps) {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden bg-[#F5F0EB]">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h1 className="text-3xl md:text-5xl font-bold leading-tight text-[#1A1A1A]">{title}</h1>
          <p className="mt-3 text-base text-[#4A4A4A] leading-relaxed">{subtitle}</p>

          <div className="mt-6 flex flex-wrap gap-2">
            <Link to={ctaLink} className="bg-[#C2654A] hover:bg-[#A8513A] text-white font-semibold text-base py-3 px-6 rounded-xl transition-colors duration-200">{ctaText}</Link>
            <Link to={secondaryCtaLink} className="bg-white border border-[#E5E5E5] hover:border-[#C2654A] text-[#1A1A1A] font-medium text-base py-3 px-6 rounded-xl transition-colors duration-200">{secondaryCtaText}</Link>
          </div>
        </div>
      </div>
    </section>
  );
}