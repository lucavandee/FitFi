import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import Seo from '@/components/Seo';
import Button from '../components/ui/Button';
import HeroTitle from '@/components/marketing/HeroTitle';
import Chip from '@/components/ui/Chip';
import Hero from "../components/sections/Hero";

const HomePage: React.FC = () => {
  const { user } = useUser();

  const handleStartQuiz = () => {
    // Track quiz start from home hero
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'quiz_start', { 
        location: 'home_hero',
        event_category: 'conversion',
        event_label: 'home_cta_click'
      });
    }
  };

  return (
    <>
      <Seo 
        title="FitFi - AI Styling voor jouw perfecte outfit"
        description="Ontdek jouw unieke stijl met AI-powered outfit aanbevelingen. Persoonlijke styling advies op basis van jouw voorkeuren en lichaamsbouw."
        canonical="https://fitfi.app/home"
        keywords="AI personal stylist, outfit aanbevelingen, stijl quiz, fashion advies, Nederlandse mode platform"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "FitFi",
          "url": "https://fitfi.ai",
          "logo": "https://fitfi.ai/logo.png"
        }}
      />
    <div className="min-h-screen bg-[#FAF8F6] flex items-center justify-center ff-hero-card">
      <div className="not-prose text-center max-w-2xl mx-auto p-8">
        <div className="w-20 h-20 bg-[#bfae9f] rounded-full flex items-center justify-center mx-auto mb-6">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
        
        <div className="mb-6">
          <HeroTitle
            lines={[
              'Ontdek wat',
              'jouw stijl',
              'over je zegt',
            ]}
            accents={{
              1: [
                { word: 'jouw', className: 'text-gradient-soft', onlyFirst: true },
                { word: 'stijl', className: 'text-gradient accent-bump sheen', onlyFirst: true },
              ],
            }}
            className="mb-6"
            balance
          />
        </div>
        
        <p className="copy-muted text-lg md:text-xl mt-4 max-w-2xl mx-auto mb-8 leading-relaxed copy-narrow">
          Krijg in 2 minuten een gepersonaliseerd AI-rapport dat onthult hoe jouw kledingkeuzes 
          jouw persoonlijkheid weerspiegelen en hoe je dit kunt gebruiken om jouw doelen te bereiken.
        </p>
        
        {/* Trust Indicators */}
        <div className="flex flex-wrap justify-center gap-3 mt-4 mb-8">
          <Chip>100% Gratis</Chip>
    <main className="bg-app">
      <Hero />
    </main>
    
    {/* Sticky Mobile CTA */}
    <div className="ff-sticky-cta md:hidden">
      <a href="/get-started" className="ff-cta" data-analytics="sticky-cta" onClick={trackStickyCTA}>Start gratis</a>
    </div>
    </>
  );
};

export default HomePage;
  )
}