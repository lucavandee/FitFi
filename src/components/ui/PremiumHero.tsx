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
      <div className="absolute inset-0 bg-gradient-to-br from-[#2B6AF3]/10 via-transparent to-[#67E8F9]/5"></div>
      
      {/* Floating elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-[#2B6AF3]/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 right-12 w-40 h-40 bg-[#67E8F9]/20 rounded-full blur-3xl"></div>

      <div className="relative ff-container">
        <div className="max-w-2xl">
          <h1 className="font-heading text-3xl md:text-5xl ff-text-balance">{title}</h1>
          <p className="mt-3 text-text/80">{subtitle}</p>

          <div className="mt-6 flex flex-wrap gap-2">
            <Link to={ctaLink} className="ff-btn ff-btn-primary h-10">{ctaText}</Link>
            <Link to={secondaryCtaLink} className="ff-btn ff-btn-secondary h-10">{secondaryCtaText}</Link>
          </div>
        </div>
      </div>
    </section>
  );
}