import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Users, TrendingUp } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
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
        description="Ontdek jouw unieke stijl met onze AI-gedreven style quiz. Krijg gepersonaliseerde outfit aanbevelingen die perfect bij jou passen."
        canonical="https://fitfi.ai/"
      />
      <main id="main" className="bg-[var(--color-bg)] min-h-screen">
        <Helmet>
          <title>FitFi - AI Style Report voor jouw perfecte look</title>
          <meta name="description" content="Ontdek jouw perfecte stijl met onze AI-gedreven style reports. Persoonlijke outfit aanbevelingen op basis van jouw unieke profiel." />
        </Helmet>
        
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
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center ff-hero-card">
        {/* Hero Section */}
        <section className="hero-gradient py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-4xl md:text-6xl font-bold font-montserrat text-[var(--color-text)] mb-6">
                  Ontdek jouw perfecte <span className="text-[var(--ff-color-primary-700)]">stijl</span> met AI
                </h1>
                <p className="text-xl text-[var(--color-text-secondary)] mb-8 leading-relaxed font-lato">
                  Krijg een persoonlijk AI Style Report met outfit aanbevelingen die perfect bij jou passen. 
                  Van casual tot chic - wij helpen je de beste versie van jezelf te worden.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" asChild>
                    <Link to="/quiz" className="inline-flex items-center">
                    Start je AI Style Report
                    <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link to="/hoe-het-werkt">
                    Hoe het werkt
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="relative">
                <Card className="premium-shadow-lg p-8">
                  <div className="aspect-square bg-gradient-to-br from-[var(--ff-color-primary-50)] to-[var(--ff-color-primary-100)] rounded-xl flex items-center justify-center">
                    <SmartImage
                      src="/images/hero-style.jpg"
                      alt="AI Style Report preview"
                      className="w-full h-full object-cover rounded-xl"
                      fallback={<Sparkles className="h-24 w-24 text-[var(--ff-color-primary-600)]" />}
                    />
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold font-montserrat text-[var(--color-text)] mb-4">
                Waarom kiezen voor FitFi?
              </h2>
              <p className="text-xl text-[var(--color-text-secondary)] max-w-3xl mx-auto font-lato">
                Onze AI-technologie analyseert jouw unieke stijlprofiel en geeft je gepersonaliseerde aanbevelingen
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="p-8 text-center hover">
                <div className="bg-[var(--ff-color-primary-100)] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="h-8 w-8 text-[var(--ff-color-primary-600)]" />
                </div>
                <h3 className="text-xl font-semibold font-montserrat text-[var(--color-text)] mb-4">AI-gedreven analyse</h3>
                <p className="text-[var(--color-text-secondary)] font-lato">
                  Geavanceerde algoritmes analyseren jouw stijlvoorkeuren en lichaamsbouw voor perfecte matches
                </p>
              </Card>
              
              <Card className="p-8 text-center hover">
                <div className="bg-[var(--ff-color-success-100)] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="h-8 w-8 text-[var(--ff-color-success-600)]" />
                </div>
                <h3 className="text-xl font-semibold font-montserrat text-[var(--color-text)] mb-4">Persoonlijke styling</h3>
                <p className="text-[var(--color-text-secondary)] font-lato">
                  Elke aanbeveling is uniek voor jou, gebaseerd op jouw lifestyle en voorkeuren
                </p>
              </Card>
              
              <Card className="p-8 text-center hover">
                <div className="bg-[var(--ff-color-accent-100)] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <TrendingUp className="h-8 w-8 text-[var(--ff-color-accent-600)]" />
                </div>
                <h3 className="text-xl font-semibold font-montserrat text-[var(--color-text)] mb-4">Trending looks</h3>
                <p className="text-[var(--color-text-secondary)] font-lato">
                  Blijf up-to-date met de laatste modetrends die bij jouw stijl passen
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 bg-[var(--color-surface)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold font-montserrat text-[var(--color-text)] mb-4">
                Zo werkt het
              </h2>
              <p className="text-xl text-[var(--color-text-secondary)] font-lato">
                In 3 eenvoudige stappen naar jouw perfecte stijl
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-[var(--ff-color-primary-700)] text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold font-montserrat">
                  1
                </div>
                <h3 className="text-xl font-semibold font-montserrat text-[var(--color-text)] mb-4">Vul de quiz in</h3>
                <p className="text-[var(--color-text-secondary)] font-lato">
                  Beantwoord vragen over jouw stijl, lichaamsbouw en voorkeuren
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-[var(--ff-color-primary-700)] text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold font-montserrat">
                  2
                </div>
                <h3 className="text-xl font-semibold font-montserrat text-[var(--color-text)] mb-4">Ontvang je rapport</h3>
                <p className="text-[var(--color-text-secondary)] font-lato">
                  Krijg een uitgebreid AI Style Report met gepersonaliseerde aanbevelingen
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-[var(--ff-color-primary-700)] text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold font-montserrat">
                  3
                </div>
                <h3 className="text-xl font-semibold font-montserrat text-[var(--color-text)] mb-4">Shop je looks</h3>
                <p className="text-[var(--color-text-secondary)] font-lato">
                  Koop direct de aanbevolen items via onze partner webshops
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold font-montserrat text-[var(--color-text)] mb-6">
              Klaar om jouw perfecte stijl te ontdekken?
            </h2>
            <p className="text-xl text-[var(--color-text-secondary)] mb-8 font-lato">
              Start vandaag nog met je gratis AI Style Report en transformeer je garderobe
            </p>
            <Button size="lg" className="cta-gradient" asChild>
              <Link to="/quiz" className="inline-flex items-center">
              Start je gratis Style Report
              <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>

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
            <Chip>2 Minuten</Chip>
            <Chip>Direct Resultaat</Chip>
          </div>
          
          <div className="space-y-4">
            {user ? (
              <>
                <Button 
                  as={Link}
                  to="/dashboard" 
                  variant="primary"
                  size="lg"
                  icon={<ArrowRight size={20} />}
                  iconPosition="right"
                  data-ff-event="cta_click"
                  data-ff-loc="home_hero"
                >
                  Ga naar Dashboard
                </Button>
                <p className="copy-muted text-lg md:text-xl mt-4 max-w-2xl mx-auto mb-8 leading-relaxed copy-narrow">
                  Welkom terug, {user.name}!
                </p>
              </>
            ) : (
              <>
                <Button 
                  as={Link}
                  to="/registreren" 
                  onClick={handleStartQuiz}
                  variant="primary"
                  size="lg"
                  icon={<ArrowRight size={20} />}
                  iconPosition="right"
                  className="bg-[#bfae9f] hover:bg-[#a89a8c] text-white"
                  data-ff-event="cta_click"
                  data-ff-loc="home_hero"
                >
                  Start nu gratis
                </Button>
                <p className="text-sm text-gray-500 mt-4">
                  Geen creditcard vereist • Privacy gegarandeerd • 10.000+ rapporten gegenereerd
                </p>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Sticky Mobile CTA */}
      <div className="ff-sticky-cta md:hidden">
        <a href="/get-started" className="ff-cta" data-analytics="sticky-cta" onClick={trackStickyCTA}>Start gratis</a>
      </div>
      </main>
    </>
  );
};

export default HomePage;