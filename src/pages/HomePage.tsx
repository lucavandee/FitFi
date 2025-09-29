import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Users, TrendingUp } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import Hero from '@/components/landing/Hero';
import SmartImage from '@/components/media/SmartImage';
import Seo from '@/components/Seo';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import HeroTitle from '@/components/marketing/HeroTitle';
import Chip from '@/components/ui/Chip';
import { useUser } from '../context/UserContext';
import { trackStickyCTA } from '@/hooks/useABTesting';

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
        title="FitFi - AI Style Report voor jouw perfecte outfit"
        description="Ontdek jouw unieke stijl met onze AI-gedreven stijlquiz. Krijg persoonlijke outfit aanbevelingen die perfect bij jou passen."
        canonical="https://fitfi.ai/"
      />
      <main id="main" className="bg-[var(--color-bg)] min-h-screen">
        <Helmet>
          <title>FitFi - AI Style Report voor jouw perfecte look</title>
          <meta name="description" content="Ontdek jouw perfecte look met FitFi's AI Style Reports. Persoonlijke outfit aanbevelingen op basis van jouw unieke profiel." />
        </Helmet>
        
        <Seo 
          title="FitFi - AI Styling voor jouw perfecte outfit"
          description="Ontdek jouw unieke stijl met AI-powered outfit aanbevelingen en persoonlijk styling advies op basis van jouw voorkeuren en lichaamsbouw."
          canonical="https://fitfi.ai/"
          keywords="AI personal stylist, outfit aanbevelingen, stijl quiz, fashion advies, Nederlandse mode platform"
          jsonLd={{
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "FitFi",
            "url": "https://fitfi.ai",
            "logo": "https://fitfi.ai/logo.png"
          }}
        />
      <Hero />
      
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center ff-hero-card">
        {/* Hero Section */}
        <section className="hero-gradient py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-4xl md:text-6xl font-bold font-montserrat text-[var(--color-text)] mb-6">
                  Ontdek jouw perfecte stijl — snel, slim en persoonlijk
                </h1>
                <p className="text-lg md:text-xl text-[var(--color-text)]/80 mb-8">
                  Onze AI-stylist leert jouw smaak kennen en stelt outfits samen die écht werken voor jouw leven.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link to="/results" onClick={handleStartQuiz} className="ff-cta px-6 py-3 rounded-2xl text-center">
                    Start gratis
                  </Link>
                  <Link to="/hoe-het-werkt" className="px-6 py-3 rounded-2xl border text-[var(--color-text)] border-[var(--color-border)] text-center">
                    Hoe het werkt
                  </Link>
                </div>
              </div>
              <div>
                <SmartImage
                  src="/images/hero/ai-stylist.jpg"
                  alt="AI stylist die outfits samenstelt"
                  className="rounded-2xl shadow-xl w-full h-auto"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-[var(--color-surface)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold font-montserrat text-[var(--color-text)] mb-4">
                Waarom FitFi?
              </h2>
              <p className="text-lg text-[var(--color-text)]/80 max-w-2xl mx-auto">
                Onze AI begrijpt jouw unieke stijl en helpt je outfits te vinden die perfect bij je passen.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="text-center p-8">
                <div className="w-16 h-16 bg-[var(--ff-color-primary-100)] rounded-full flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-8 h-8 text-[var(--ff-color-primary-700)]" />
                </div>
                <h3 className="text-xl font-semibold font-montserrat text-[var(--color-text)] mb-4">
                  AI-gedreven styling
                </h3>
                <p className="text-[var(--color-text)]/80">
                  Onze geavanceerde AI analyseert jouw voorkeuren en stelt persoonlijke outfits samen.
                </p>
              </Card>
              
              <Card className="text-center p-8">
                <div className="w-16 h-16 bg-[var(--ff-color-primary-100)] rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8 text-[var(--ff-color-primary-700)]" />
                </div>
                <h3 className="text-xl font-semibold font-montserrat text-[var(--color-text)] mb-4">
                  Community & tribes
                </h3>
                <p className="text-[var(--color-text)]/80">
                  Deel je stijl met gelijkgestemden en ontdek nieuwe inspiratie in onze tribes.
                </p>
              </Card>
              
              <Card className="text-center p-8">
                <div className="w-16 h-16 bg-[var(--ff-color-primary-100)] rounded-full flex items-center justify-center mx-auto mb-6">
                  <TrendingUp className="w-8 h-8 text-[var(--ff-color-primary-700)]" />
                </div>
                <h3 className="text-xl font-semibold font-montserrat text-[var(--color-text)] mb-4">
                  Altijd up-to-date
                </h3>
                <p className="text-[var(--color-text)]/80">
                  Blijf op de hoogte van de laatste trends en krijg seizoensgebonden aanbevelingen.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold font-montserrat text-[var(--color-text)] mb-6">
              Klaar om jouw perfecte stijl te ontdekken?
            </h2>
            <p className="text-lg text-[var(--color-text)]/80 mb-8 max-w-2xl mx-auto">
              Start vandaag nog met onze gratis stijlquiz en ontvang binnen enkele minuten jouw persoonlijke style report.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                as={Link} 
                to="/results" 
                variant="primary" 
                size="lg"
                onClick={handleStartQuiz}
                className="inline-flex items-center gap-2"
              >
                Start gratis quiz
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button 
                as={Link} 
                to="/hoe-het-werkt" 
                variant="secondary" 
                size="lg"
              >
                Meer informatie
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default HomePage;