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
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--ff-color-primary-100)]/40 via-transparent to-[var(--ff-color-accent-100)]/20"></div>

      {/* Floating elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-[var(--ff-color-primary-200)]/40 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 right-12 w-40 h-40 bg-[var(--ff-color-accent-200)]/40 rounded-full blur-3xl"></div>

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