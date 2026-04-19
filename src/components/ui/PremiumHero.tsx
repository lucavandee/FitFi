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
    <section className="relative py-20 md:py-32 overflow-hidden ff-hero-card">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FAF5F2]/40 via-transparent to-[#FAF5F2]/20"></div>

      {/* Floating elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-[#F4E8E3]/40 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 right-12 w-40 h-40 bg-[#F4E8E3]/40 rounded-full blur-3xl"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h1 className="font-heading text-3xl md:text-5xl ff-text-balance">{title}</h1>
          <p className="mt-3 text-text/80">{subtitle}</p>

          <div className="mt-6 flex flex-wrap gap-2">
            <Link to={ctaLink} className="bg-[#C2654A] hover:bg-[#A8513A] text-white font-semibold text-base py-3 px-6 rounded-xl">{ctaText}</Link>
            <Link to={secondaryCtaLink} className="bg-white border border-[#E5E5E5] hover:border-[#C2654A] text-[#1A1A1A] font-medium text-base py-3 px-6 rounded-xl">{secondaryCtaText}</Link>
          </div>
        </div>
      </div>
    </section>
  );
}